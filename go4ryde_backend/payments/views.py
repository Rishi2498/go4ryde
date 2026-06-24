import razorpay
import json
import hmac
import hashlib
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from payments.throttles import *
from bookings.models import *
from payments.models import *
from payments.utils import *
from payments.serializers import *
from rest_framework.throttling import UserRateThrottle
from rest_framework.decorators import throttle_classes
from decimal import Decimal
from notifications.dispatcher import NotificationDispatcher
from core.models import PlatformFee

def calculate_partial_amount(booking):

    fee = PlatformFee.objects.first()

    partial_percent = Decimal("20")

    if fee:

        partial_percent = getattr(
            fee,
            "partial_payment_percentage",
            Decimal("20")
        )

    return (
        Decimal(str(booking.final_amount))
        * partial_percent
        / Decimal("100")
    )
# -------------------------
# 🚀 CREATE PAYMENT (API)
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([CreatePaymentThrottle])  # ✅ rate limiter intact
@transaction.atomic
def create_payment(request):

    booking_id = request.data.get("booking_id")
    payment_type = request.data.get("payment_type")

    if not booking_id or not payment_type:
        return Response({"error": "Missing data"}, status=400)

    if payment_type not in ["FULL", "WALLET", "COD","PARTIAL",]:
        return Response({"error": "Invalid payment type"}, status=400)

    booking = Booking.objects.select_for_update().filter(id=booking_id).first()

    if not booking:
        return Response({"error": "Booking not found"}, status=404)

    if booking.user != request.user:
        return Response({"error": "Not your booking"}, status=403)

    if booking.status == "CANCELLED":
        return Response({"error": "Booking cancelled"}, status=400)

    if booking.payment_status == "PAID":
        return Response({"error": "Already paid"}, status=400)

    amount = booking.final_amount
    if payment_type == "PARTIAL":

        partial_amount = calculate_partial_amount(
            booking
        )

        client = razorpay.Client(
            auth=(
                settings.RAZORPAY_KEY_ID,
                settings.RAZORPAY_KEY_SECRET
            )
        )

        order = client.order.create({
            "amount": int(
                partial_amount * 100
            ),
            "currency": "INR",
            "payment_capture": 1
        })

        Payment.objects.create(
            booking=booking,
            razorpay_order_id=order["id"],
            amount=partial_amount,
            payment_type="PARTIAL",
            status="CREATED",
            is_final_payment=False
        )

        return Response({
            "order_id": order["id"],
            "amount": int(
                partial_amount * 100
            ),
            "key": settings.RAZORPAY_KEY_ID
        })
    # ====================================
    # 💰 WALLET PAYMENT
    # ====================================
    if payment_type == "WALLET":
        from payments.models import Wallet, WalletTransaction

        wallet, _ = Wallet.objects.select_for_update().get_or_create(
                user=request.user,
                defaults={"balance": 0}
                )

        if wallet.balance < amount:
            return Response({"error": "Insufficient wallet balance"}, status=400)

        wallet.balance -= amount
        wallet.save()

        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount,
            transaction_type="DEBIT",
            source="PAYMENT",
            reference_id=str(booking.id)
        )

        payment = Payment.objects.create(
            booking=booking,
            amount=amount,
            payment_type="WALLET",
            status="SUCCESS",
            is_final_payment=True
        )

        update_booking_after_payment(payment)

        return Response({"message": "Paid via wallet"})

    # ====================================
    # 💵 COD PAYMENT
    # ====================================
    if payment_type == "COD":

        Payment.objects.create(
            booking=booking,
            amount=amount,
            payment_type="COD",
            status="Cash",
            is_final_payment=True
        )

        booking.payment_status = "Cash"
        booking.save(update_fields=["payment_status"])

        return Response({
            "message": "Cash payment selected"
        })
    # ====================================
    # 💳 ONLINE PAYMENT (RAZORPAY)
    # ====================================
    existing_payment = Payment.objects.filter(
        booking=booking,
        payment_type="FULL",
        status="CREATED"
    ).order_by("-created_at").first()

    if existing_payment:
        return Response({
            "order_id": existing_payment.razorpay_order_id,
            "amount": int(existing_payment.amount * 100),
            "key": settings.RAZORPAY_KEY_ID,
            "message": "Reusing existing payment"
        })

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    try:
        order = client.order.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "payment_capture": 1
        })

        Payment.objects.create(
            booking=booking,
            razorpay_order_id=order["id"],
            amount=amount,
            payment_type="FULL",
            status="CREATED",
            is_final_payment=True
        )

        return Response({
            "order_id": order["id"],
            "amount": int(amount * 100),
            "key": settings.RAZORPAY_KEY_ID
        })

    except razorpay.errors.BadRequestError:
        return Response({"error": "Razorpay error"}, status=400)

    except Exception:
        return Response({"error": "Server error"}, status=500)

# -------------------------
# 🚀 VERIFY PAYMENT (API)
# -------------------------
@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([VerifyPaymentThrottle])  # ✅ rate limiter intact
@transaction.atomic
def verify_payment(request):

    order_id = request.data.get("order_id")
    payment_id = request.data.get("payment_id")
    signature = request.data.get("signature")

    if not order_id or not payment_id or not signature:
        return Response({"error": "Missing data"}, status=400)

    payment = get_object_or_404(Payment, razorpay_order_id=order_id)

    if payment.status == "SUCCESS":
        return Response({"message": "Already verified"}, status=200)

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = "SUCCESS"
        payment.save()
        NotificationDispatcher.trigger(
    "PAYMENT_SUCCESS",
    payment.booking,

    amount=payment.amount,

    source=payment.booking.ride.source,

    destination=payment.booking.ride.destination,

    metadata={
        "route": f"/booking/{payment.booking.id}"
    }
)       
        booking = payment.booking
        if payment.payment_type == "PARTIAL":

            booking.payment_status = (
                "PARTIALLY_PAID"
            )

            booking.remaining_amount = (
    Decimal(str(booking.final_amount))
    - Decimal(str(payment.amount))
)

            booking.save()

            NotificationDispatcher.trigger(
                "PARTIAL_PAYMENT_SUCCESS",
                booking,
                amount=payment.amount,
                metadata={
                    "route":
                    f"/booking/{booking.id}"
                }
            )
        elif booking.payment_status == "PARTIALLY_PAID":

            booking.payment_status = "PAID"
            booking.remaining_amount = 0

            booking.save()

            NotificationDispatcher.trigger(
                "FINAL_PAYMENT_SUCCESS",
                booking,
                amount=payment.amount,
                metadata={
                    "route":
                    f"/booking/{booking.id}"
                }
            )
        else:

            update_booking_after_payment(
                payment
            )

            NotificationDispatcher.trigger(
                "PAYMENT_SUCCESS",
                booking,
                amount=payment.amount,
                source=booking.ride.source,
                destination=booking.ride.destination,
                metadata={
                    "route":
                    f"/booking/{booking.id}"
                }
            )
                # 🔥 CREDIT DRIVER WALLET
        from payments.models import Wallet, WalletTransaction

        driver = payment.booking.ride.driver

        driver_wallet, _ = Wallet.objects.get_or_create(user=driver)

        driver_wallet.balance += payment.amount
        driver_wallet.save()

        WalletTransaction.objects.create(
            wallet=driver_wallet,
            amount=payment.amount,
            transaction_type="CREDIT",
            source="PAYMENT",
            reference_id=str(payment.booking.id)
        )

        update_booking_after_payment(payment)
        
        return Response({"message": "Payment success"})

    except Exception  as e:
        print("VERIFY ERROR:", str(e))
        payment.status = "FAILED"
        payment.save()
        return Response({
            "error": str(e)
        }, status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def pay_remaining_amount(
    request,
    booking_id
):

    booking = get_object_or_404(
        Booking,
        id=booking_id
    )

    if booking.user != request.user:
        return Response(
            {"error": "Not your booking"},
            status=403
        )

    if booking.payment_status != "PARTIALLY_PAID":
        return Response(
            {
                "error":
                "Booking is not partially paid"
            },
            status=400
        )

    if booking.remaining_amount <= 0:
        return Response(
            {
                "error":
                "No remaining amount"
            },
            status=400
        )

    client = razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET
        )
    )

    order = client.order.create({
        "amount": int(
            booking.remaining_amount * 100
        ),
        "currency": "INR",
        "payment_capture": 1
    })

    payment = Payment.objects.create(
        booking=booking,
        razorpay_order_id=order["id"],
        amount=booking.remaining_amount,
        payment_type="FULL",
        status="CREATED",
        is_final_payment=True
    )

    return Response({
        "order_id": order["id"],
        "amount": int(
            booking.remaining_amount * 100
        ),
        "key": settings.RAZORPAY_KEY_ID,
        "payment_id": payment.id
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([CreatePaymentThrottle])  # reuse throttle
@transaction.atomic
def withdraw_to_bank(request):

    from payments.models import Wallet, WalletTransaction
    from decimal import Decimal

    amount = Decimal(str(request.data.get("amount", 0)))

    if amount <= 0:
        return Response({"error": "Invalid amount"}, status=400)

    wallet, _ = Wallet.objects.select_for_update().get_or_create(
              user=request.user,
              defaults={"balance": 0}
              )

    if wallet.balance < amount:
        return Response({"error": "Insufficient balance"}, status=400)

    wallet.balance -= amount
    wallet.save()
    NotificationDispatcher.trigger(
    "WALLET_DEBITED",
    transaction,
    amount=amount,
    metadata={
        "route": "/wallet/transactions"
    }
)
    WalletTransaction.objects.create(
        wallet=wallet,
        amount=amount,
        transaction_type="DEBIT",
        source="WITHDRAWAL"
    )

    # 🔥 Here you integrate Razorpay payout later

    return Response({"message": "Withdrawal initiated"})

@csrf_exempt
def razorpay_webhook(request):

    body = request.body
    signature = request.headers.get("X-Razorpay-Signature")

    # ❌ Missing signature
    if not signature:
        return HttpResponse(status=400)

    # 🔐 Verify signature
    expected = hmac.new(
        bytes(settings.RAZORPAY_WEBHOOK_SECRET, "utf-8"),
        body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        return HttpResponse(status=400)

    # 🔄 Parse payload
    try:
        data = json.loads(body)
    except Exception:
        return HttpResponse(status=400)

    event = data.get("event")

    # ==========================================
    # ✅ HANDLE SUCCESS PAYMENT
    # ==========================================
    if event == "payment.captured":

        entity = data["payload"]["payment"]["entity"]

        order_id = entity.get("order_id")
        payment_id = entity.get("id")

        if not order_id:
            return HttpResponse(status=200)

        try:
            # 🔒 Lock payment row (important for race conditions)
            payment = Payment.objects.select_for_update().get(
                razorpay_order_id=order_id
            )

            # 🔥 IDEMPOTENCY CHECK (CRITICAL)
            if payment.status == "SUCCESS":
                return HttpResponse(status=200)

            # ✅ Update payment
            payment.razorpay_payment_id = payment_id
            payment.status = "SUCCESS"
            payment.save()

            # ==========================================
            # 💰 CREDIT DRIVER WALLET (SAFE)
            # ==========================================
            from payments.models import Wallet, WalletTransaction

            driver = payment.booking.ride.driver

            driver_wallet, _ = Wallet.objects.get_or_create(user=driver)

            # 🔥 Prevent double credit (extra safety)
            already_credited = WalletTransaction.objects.filter(
                wallet=driver_wallet,
                reference_id=str(payment.booking.id),
                source="PAYMENT",
                transaction_type="CREDIT"
            ).exists()

            if not already_credited:
                driver_wallet.balance += payment.amount
                driver_wallet.save()

                WalletTransaction.objects.create(
                    wallet=driver_wallet,
                    amount=payment.amount,
                    transaction_type="CREDIT",
                    source="PAYMENT",
                    reference_id=str(payment.booking.id)
                )

            # ==========================================
            # 📦 UPDATE BOOKING
            # ==========================================
            update_booking_after_payment(payment)

        except Payment.DoesNotExist:
            pass

        except Exception as e:
            # ⚠️ Never crash webhook (important)
            print("Webhook error:", str(e))
            return HttpResponse(status=200)

    return HttpResponse(status=200)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_wallet_topup(request):

    import razorpay
    from decimal import Decimal
    from django.conf import settings

    amount = request.data.get("amount")

    if not amount:
        return Response({"error": "Amount required"}, status=400)

    try:
        amount = Decimal(str(amount))
    except:
        return Response({"error": "Invalid amount"}, status=400)

    if amount <= 0:
        return Response({"error": "Amount must be positive"}, status=400)

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    try:
        order = client.order.create({
            "amount": int(amount * 100),
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "order_id": order["id"],
            "amount": int(amount * 100),
            "key": settings.RAZORPAY_KEY_ID
        })

    except Exception:
        return Response({"error": "Payment init failed"}, status=500)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def verify_wallet_topup(request):

    import razorpay
    from payments.models import Wallet, WalletTransaction
    from decimal import Decimal

    order_id = request.data.get("order_id")
    payment_id = request.data.get("payment_id")
    signature = request.data.get("signature")
    amount = request.data.get("amount")

    if not all([order_id, payment_id, signature, amount]):
        return Response({"error": "Missing data"}, status=400)

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    try:
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        wallet, _ = Wallet.objects.select_for_update().get_or_create(user=request.user)

        amount = Decimal(str(amount))

        wallet.balance += amount
        wallet.save()
        NotificationDispatcher.trigger(
    "WALLET_CREDITED",
    transaction,
    amount=amount,
    metadata={
        "route": "/wallet/transactions"
    }
)
        WalletTransaction.objects.create(
            wallet=wallet,
            amount=amount,
            transaction_type="CREDIT",
            source="DEPOSIT",
            reference_id=order_id
        )
      
        return Response({"message": "Wallet updated"})

    except Exception:
        return Response({"error": "Verification failed"}, status=400)

from rest_framework.decorators import (
    api_view,
    permission_classes
)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def save_bank_account(request):

    user = request.user

    account_holder_name = request.data.get(
        "account_holder_name"
    )

    bank_name = request.data.get(
        "bank_name"
    )

    account_number = request.data.get(
        "account_number"
    )

    ifsc_code = request.data.get(
        "ifsc_code"
    )

    upi_id = request.data.get(
        "upi_id"
    )

    # ✅ validation
    if not account_holder_name:
        return Response(
            {"error": "Account holder required"},
            status=400
        )

    if not bank_name:
        return Response(
            {"error": "Bank name required"},
            status=400
        )

    if not account_number:
        return Response(
            {"error": "Account number required"},
            status=400
        )

    if not ifsc_code:
        return Response(
            {"error": "IFSC code required"},
            status=400
        )

    # ✅ update or create
    bank_account, created = (
        BankAccount.objects.update_or_create(

            user=user,

            defaults={

                "account_holder_name":
                    account_holder_name,

                "bank_name":
                    bank_name,

                "account_number":
                    account_number,

                "ifsc_code":
                    ifsc_code,

                "upi_id":
                    upi_id,
            }
        )
    )

    return Response({

        "message":
            "Bank account saved successfully",

        "bank_account_id":
            bank_account.id,

    })
    
    # payments/views.py



@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([
    CreatePaymentThrottle,
    WithdrawalThrottle
])
@transaction.atomic
def withdraw_wallet(request):

    user = request.user

    amount = Decimal(str(request.data.get("amount")))

    bank_account = BankAccount.objects.get(
        user=user
    )

    wallet = Wallet.objects.select_for_update().get(
        user=user
    )

    if wallet.balance < amount:
        return Response(
            {"error": "Insufficient balance"},
            status=400
        )

    wallet.balance -= amount
    wallet.save()

    WalletTransaction.objects.create(
        wallet=wallet,
        amount=amount,
        transaction_type="DEBIT",
        source="WITHDRAWAL"
    )

    withdrawal = Withdrawal.objects.create(
        user=user,
        amount=amount,
        bank_account=bank_account,
        status="PENDING"
    )

    NotificationDispatcher.trigger(
        "WALLET_WITHDRAW",
        withdrawal,
        amount=amount,
        metadata={
            "route": "/wallet/withdrawals"
        }
    )

    return Response({
        "message": "Withdrawal request submitted",
        "withdrawal_id": withdrawal.id,
        "status": withdrawal.status,
    })




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_withdrawals(request):

    withdrawals = Withdrawal.objects.filter(
        user=request.user
    ).order_by(
        "-created_at"
    )

    serializer = WithdrawalSerializer(
        withdrawals,
        many=True
    )

    return Response(
        serializer.data
    )