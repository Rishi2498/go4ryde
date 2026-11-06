import razorpay
import json
import hmac
import hashlib

from decimal import Decimal
from datetime import timedelta

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import transaction

from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from payments.throttles import *
from bookings.models import *
from payments.models import *
from payments.utils import *
from payments.serializers import *

from notifications.dispatcher import NotificationDispatcher
from core.models import PlatformFee


# ============================================================
# RAZORPAY CLIENT
# ============================================================

def get_razorpay_client():
    return razorpay.Client(
        auth=(
            settings.RAZORPAY_KEY_ID,
            settings.RAZORPAY_KEY_SECRET,
        )
    )


# ============================================================
# CREATE BOOKING PAYMENT
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([CreatePaymentThrottle])
@transaction.atomic
def create_payment(request):

    booking_id = request.data.get("booking_id")
    payment_type = request.data.get("payment_type", "FULL")

    # --------------------------------------------------------
    # GET BOOKING
    # --------------------------------------------------------

    booking = get_object_or_404(
        Booking.objects.select_for_update(),
        id=booking_id,
        user=request.user,
    )

    # --------------------------------------------------------
    # CHECK BOOKING STATUS
    # --------------------------------------------------------

    if booking.status == "CANCELLED":
        return Response(
            {
                "error": "Booking cancelled"
            },
            status=400,
        )

    # --------------------------------------------------------
    # CHECK PAYMENT STATUS
    # --------------------------------------------------------

    if booking.payment_status == "PAID":
        return Response(
            {
                "error": "Payment already completed"
            },
            status=400,
        )

    # --------------------------------------------------------
    # GET TOTAL AMOUNT
    # --------------------------------------------------------

    try:

        total_amount = Decimal(
            str(booking.final_amount)
        )

    except Exception:

        return Response(
            {
                "error": "Invalid booking amount"
            },
            status=400,
        )

    # ========================================================
    # WALLET PAYMENT
    # ========================================================

    if payment_type == "WALLET":

        # ----------------------------------------------------
        # GET USER WALLET
        # ----------------------------------------------------

        wallet, _ = (
            Wallet.objects
            .select_for_update()
            .get_or_create(
                user=request.user
            )
        )

        # ----------------------------------------------------
        # CHECK BALANCE
        # ----------------------------------------------------

        if wallet.balance < total_amount:

            return Response(
                {
                    "error": "Insufficient wallet balance",
                    "balance": str(wallet.balance),
                    "required": str(total_amount),
                },
                status=400,
            )

        # ----------------------------------------------------
        # DEBIT WALLET
        # ----------------------------------------------------

        wallet.balance -= total_amount
        wallet.save()

        # ----------------------------------------------------
        # CREATE WALLET TRANSACTION
        # ----------------------------------------------------

        WalletTransaction.objects.create(
            wallet=wallet,
            amount=total_amount,
            transaction_type="DEBIT",
            source="PAYMENT",
            reference_id=str(booking.id),
        )

        # ----------------------------------------------------
        # CREATE PAYMENT
        # ----------------------------------------------------

        payment = Payment.objects.create(
            booking=booking,
            amount=total_amount,
            payment_type="WALLET",
            is_final_payment=True,
            status="SUCCESS",
        )

        # ----------------------------------------------------
        # UPDATE BOOKING
        # ----------------------------------------------------

        booking.payment_status = "PAID"
        booking.status = "CONFIRMED"

        booking.save(
            update_fields=[
                "payment_status",
                "status",
            ]
        )

        # ----------------------------------------------------
        # PAYMENT SUCCESS NOTIFICATION
        # ----------------------------------------------------

        try:

            print(
                "🔥 WALLET PAYMENT NOTIFICATION TRIGGER"
            )

            notification_result = (
                NotificationDispatcher.trigger(
                    "PAYMENT_SUCCESS",
                    payment,
                    amount=payment.amount,
                    booking_id=booking.id,
                    metadata={
                        "route": f"/booking/{booking.id}",
                        "booking_id": booking.id,
                        "payment_id": payment.id,
                        "payment_type": "WALLET",
                    },
                )
            )

            print(
                "🔥 WALLET PAYMENT NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ WALLET PAYMENT NOTIFICATION ERROR:",
                str(notification_error),
            )

        # ----------------------------------------------------
        # SUCCESS RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "message": "Payment completed using wallet",
                "payment_type": "WALLET",
                "amount": str(total_amount),
                "wallet_balance": str(wallet.balance),
            }
        )

    # ========================================================
    # CASH / COD
    # ========================================================

    if payment_type == "COD":

        # ----------------------------------------------------
        # CREATE CASH PAYMENT
        # ----------------------------------------------------

        payment = Payment.objects.create(
            booking=booking,
            amount=total_amount,
            payment_type="COD",
            is_final_payment=True,
            status="Cash",
        )

        # ----------------------------------------------------
        # UPDATE BOOKING
        # ----------------------------------------------------

        booking.payment_status = "PENDING"

        booking.save(
            update_fields=[
                "payment_status",
            ]
        )

        # ----------------------------------------------------
        # CASH PAYMENT NOTIFICATION
        # ----------------------------------------------------

        try:

            print(
                "🔥 CASH PAYMENT NOTIFICATION TRIGGER"
            )

            notification_result = (
                NotificationDispatcher.trigger(
                    "PAYMENT_CASH_SELECTED",
                    payment,
                    amount=total_amount,
                    booking_id=booking.id,
                    metadata={
                        "route": f"/booking/{booking.id}",
                        "booking_id": booking.id,
                        "payment_id": payment.id,
                        "payment_type": "COD",
                    },
                )
            )

            print(
                "🔥 CASH PAYMENT NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ CASH PAYMENT NOTIFICATION ERROR:",
                str(notification_error),
            )

        # ----------------------------------------------------
        # SUCCESS RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "message": "Cash payment selected",
                "payment_type": "COD",
                "amount": str(total_amount),
            }
        )

    # ========================================================
    # PARTIAL PAYMENT
    # ========================================================

    if payment_type == "PARTIAL":

        partial_amount = request.data.get(
            "amount"
        )

        # ----------------------------------------------------
        # VALIDATE PARTIAL AMOUNT
        # ----------------------------------------------------

        try:

            partial_amount = Decimal(
                str(partial_amount)
            )

        except Exception:

            return Response(
                {
                    "error": "Invalid partial payment amount"
                },
                status=400,
            )

        if partial_amount <= 0:

            return Response(
                {
                    "error": "Amount must be positive"
                },
                status=400,
            )

        if partial_amount >= total_amount:

            return Response(
                {
                    "error": (
                        "Partial payment must be less "
                        "than the total amount"
                    )
                },
                status=400,
            )

        # ----------------------------------------------------
        # RAZORPAY CLIENT
        # ----------------------------------------------------

        client = get_razorpay_client()

        try:

            # ------------------------------------------------
            # CREATE RAZORPAY ORDER
            # ------------------------------------------------

            order = client.order.create(
                {
                    "amount": int(
                        partial_amount * 100
                    ),
                    "currency": "INR",
                    "receipt": (
                        f"booking_{booking.id}"
                    ),
                    "notes": {
                        "booking_id": str(
                            booking.id
                        ),
                        "user_id": str(
                            request.user.id
                        ),
                    },
                }
            )

            # ------------------------------------------------
            # CREATE PAYMENT
            # ------------------------------------------------

            Payment.objects.create(
                booking=booking,
                razorpay_order_id=order["id"],
                amount=partial_amount,
                payment_type="PARTIAL",
                is_final_payment=False,
                status="CREATED",
            )

            # ------------------------------------------------
            # RESPONSE
            # ------------------------------------------------

            return Response(
                {
                    "order_id": order["id"],
                    "amount": int(
                        partial_amount * 100
                    ),
                    "currency": "INR",
                    "key": settings.RAZORPAY_KEY_ID,
                    "payment_type": "PARTIAL",
                }
            )

        except Exception as e:

            print(
                "PARTIAL PAYMENT ERROR:",
                str(e),
            )

            return Response(
                {
                    "error": "Payment initialization failed"
                },
                status=500,
            )

    # ========================================================
    # FULL ONLINE PAYMENT
    # ========================================================

    client = get_razorpay_client()

    try:

        # ----------------------------------------------------
        # CHECK EXISTING PAYMENT
        # ----------------------------------------------------

        existing_payment = (
            Payment.objects
            .filter(
                booking=booking,
                status__in=[
                    "CREATED",
                    "PENDING",
                ],
                payment_type="FULL",
            )
            .order_by(
                "-created_at"
            )
            .first()
        )

        # ----------------------------------------------------
        # RETURN EXISTING RAZORPAY ORDER
        # ----------------------------------------------------

        if (
            existing_payment
            and existing_payment.razorpay_order_id
        ):

            return Response(
                {
                    "order_id": (
                        existing_payment
                        .razorpay_order_id
                    ),
                    "amount": int(
                        existing_payment.amount
                        * 100
                    ),
                    "currency": "INR",
                    "key": settings.RAZORPAY_KEY_ID,
                    "payment_type": "FULL",
                }
            )

        # ----------------------------------------------------
        # CREATE RAZORPAY ORDER
        # ----------------------------------------------------

        order = client.order.create(
            {
                "amount": int(
                    total_amount * 100
                ),
                "currency": "INR",
                "receipt": (
                    f"booking_{booking.id}"
                ),
                "notes": {
                    "booking_id": str(
                        booking.id
                    ),
                    "user_id": str(
                        request.user.id
                    ),
                },
            }
        )

        # ----------------------------------------------------
        # CREATE PAYMENT
        # ----------------------------------------------------

        Payment.objects.create(
            booking=booking,
            razorpay_order_id=order["id"],
            amount=total_amount,
            payment_type="FULL",
            is_final_payment=True,
            status="CREATED",
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "order_id": order["id"],
                "amount": int(
                    total_amount * 100
                ),
                "currency": "INR",
                "key": settings.RAZORPAY_KEY_ID,
                "payment_type": "FULL",
            }
        )

    except Exception as e:

        print(
            "FULL PAYMENT ERROR:",
            str(e),
        )

        return Response(
            {
                "error": "Payment initialization failed"
            },
            status=500,
        )
# ============================================================
# VERIFY BOOKING PAYMENT
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def verify_payment(request):

    order_id = request.data.get("order_id")
    payment_id = request.data.get("payment_id")
    signature = request.data.get("signature")

    # --------------------------------------------------------
    # VALIDATE PAYMENT DATA
    # --------------------------------------------------------

    if not all([
        order_id,
        payment_id,
        signature,
    ]):
        return Response(
            {
                "error": "Missing payment data"
            },
            status=400,
        )

    # --------------------------------------------------------
    # GET PAYMENT
    # --------------------------------------------------------

    payment = get_object_or_404(
        Payment.objects.select_for_update(),
        razorpay_order_id=order_id,
        booking__user=request.user,
    )

    # --------------------------------------------------------
    # IDEMPOTENCY
    # --------------------------------------------------------

    if payment.status == "SUCCESS":

        return Response(
            {
                "message": "Payment already verified",
                "payment_id": payment.razorpay_payment_id,
            }
        )

    client = get_razorpay_client()

    try:

        # ----------------------------------------------------
        # VERIFY RAZORPAY SIGNATURE
        # ----------------------------------------------------

        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            }
        )

        # ----------------------------------------------------
        # MARK PAYMENT SUCCESS
        # ----------------------------------------------------

        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = "SUCCESS"

        payment.save()

        # ----------------------------------------------------
        # GET BOOKING
        # ----------------------------------------------------

        booking = Booking.objects.select_for_update().get(
            id=payment.booking_id
        )

        # ----------------------------------------------------
        # MARK BOOKING AS PAID
        # ----------------------------------------------------

        booking.payment_status = "PAID"
        booking.status = "CONFIRMED"

        booking.save(
            update_fields=[
                "payment_status",
                "status",
            ]
        )

        # ----------------------------------------------------
        # PAYMENT SUCCESS NOTIFICATION
        # ----------------------------------------------------

        try:

            print(
                "🔥 PAYMENT SUCCESS NOTIFICATION TRIGGER"
            )

            notification_result = NotificationDispatcher.trigger(
                "PAYMENT_SUCCESS",
                payment,
                amount=payment.amount,
                booking_id=booking.id,
                metadata={
                    "route": f"/booking/{booking.id}",
                    "booking_id": booking.id,
                    "payment_id": payment.id,
                    "payment_type": payment.payment_type,
                },
            )

            print(
                "🔥 PAYMENT SUCCESS NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ PAYMENT SUCCESS NOTIFICATION ERROR:",
                str(notification_error),
            )

        # ----------------------------------------------------
        # DRIVER WALLET CREDIT
        # ----------------------------------------------------

        driver = getattr(
            booking,
            "driver",
            None,
        )

        if driver:

            driver_user = getattr(
                driver,
                "user",
                None,
            )

            if driver_user:

                wallet, _ = (
                    Wallet.objects
                    .select_for_update()
                    .get_or_create(
                        user=driver_user
                    )
                )

                # --------------------------------------------
                # CHECK IF DRIVER ALREADY CREDITED
                # --------------------------------------------

                already_credited = (
                    WalletTransaction.objects.filter(
                        wallet=wallet,
                        source="PAYMENT",
                        reference_id=str(payment.id),
                        transaction_type="CREDIT",
                    ).exists()
                )

                if not already_credited:

                    wallet.balance += payment.amount
                    wallet.save()

                    WalletTransaction.objects.create(
                        wallet=wallet,
                        amount=payment.amount,
                        transaction_type="CREDIT",
                        source="PAYMENT",
                        reference_id=str(payment.id),
                    )

        # ----------------------------------------------------
        # SUCCESS RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "message": "Payment verified successfully",
                "payment_id": payment_id,
                "amount": str(payment.amount),
            }
        )

    # --------------------------------------------------------
    # PAYMENT VERIFICATION FAILED
    # --------------------------------------------------------

    except Exception as e:

        print(
            "PAYMENT VERIFY ERROR:",
            str(e),
        )

        payment.status = "FAILED"

        payment.save(
            update_fields=[
                "status",
            ]
        )

        # ----------------------------------------------------
        # PAYMENT FAILED NOTIFICATION
        # ----------------------------------------------------

        try:

            print(
                "🔥 PAYMENT FAILED NOTIFICATION TRIGGER"
            )

            notification_result = NotificationDispatcher.trigger(
                "PAYMENT_FAILED",
                payment,
                booking_id=payment.booking_id,
                metadata={
                    "route": f"/booking/{payment.booking_id}",
                    "booking_id": payment.booking_id,
                    "payment_id": payment.id,
                    "payment_type": payment.payment_type,
                },
            )

            print(
                "🔥 PAYMENT FAILED NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ PAYMENT FAILED NOTIFICATION ERROR:",
                str(notification_error),
            )

        return Response(
            {
                "error": "Payment verification failed"
            },
            status=400,
        )
# ============================================================
# RAZORPAY WEBHOOK
# ============================================================

@csrf_exempt
@api_view(["POST"])
@permission_classes([AllowAny])
def razorpay_webhook(request):

    webhook_signature = request.headers.get(
        "X-Razorpay-Signature"
    )

    if not webhook_signature:
        return HttpResponse(
            "Missing signature",
            status=400,
        )

    webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET

    expected_signature = hmac.new(
        webhook_secret.encode(),
        request.body,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(
        expected_signature,
        webhook_signature,
    ):
        return HttpResponse(
            "Invalid signature",
            status=400,
        )

    try:

        payload = json.loads(
            request.body.decode("utf-8")
        )

    except Exception:

        return HttpResponse(
            "Invalid JSON",
            status=400,
        )

    event = payload.get("event")

    # ========================================================
    # PAYMENT CAPTURED
    # ========================================================

    if event == "payment.captured":

        entity = (
            payload
            .get("payload", {})
            .get("payment", {})
            .get("entity", {})
        )

        order_id = entity.get("order_id")
        payment_id = entity.get("id")

        if not order_id:
            return HttpResponse("OK", status=200)

        try:

            payment = Payment.objects.select_for_update().get(
                razorpay_order_id=order_id
            )

            with transaction.atomic():

                if payment.status != "SUCCESS":

                    payment.razorpay_payment_id = payment_id
                    payment.status = "SUCCESS"
                    payment.save(
                        update_fields=[
                            "razorpay_payment_id",
                            "status",
                        ]
                    )

                    booking = Booking.objects.select_for_update().get(
                        id=payment.booking_id
                    )

                    booking.payment_status = "PAID"
                    booking.status = "CONFIRMED"
                    booking.save(
                        update_fields=[
                            "payment_status",
                            "status",
                        ]
                    )

                    driver = getattr(
                        booking,
                        "driver",
                        None,
                    )

                    if driver:

                        driver_user = getattr(
                            driver,
                            "user",
                            None,
                        )

                        if driver_user:

                            wallet, _ = (
                                Wallet.objects
                                .select_for_update()
                                .get_or_create(
                                    user=driver_user
                                )
                            )

                            already_credited = (
                                WalletTransaction.objects.filter(
                                    wallet=wallet,
                                    source="PAYMENT",
                                    reference_id=str(payment.id),
                                    transaction_type="CREDIT",
                                ).exists()
                            )

                            if not already_credited:

                                wallet.balance += payment.amount
                                wallet.save()

                                WalletTransaction.objects.create(
                                    wallet=wallet,
                                    amount=payment.amount,
                                    transaction_type="CREDIT",
                                    source="PAYMENT",
                                    reference_id=str(payment.id),
                                )

        except Payment.DoesNotExist:

            pass

    return HttpResponse(
        "OK",
        status=200,
    )


# ============================================================
# CREATE WALLET TOP-UP
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_wallet_topup(request):

    amount = request.data.get("amount")

    try:

        amount = Decimal(str(amount))

    except (TypeError, ValueError):

        return Response(
            {"error": "Invalid amount"},
            status=400,
        )

    if amount < Decimal("10"):

        return Response(
            {
                "error": "Minimum top-up amount is ₹10"
            },
            status=400,
        )

    if amount > Decimal("100000"):

        return Response(
            {
                "error": "Maximum top-up amount is ₹1,00,000"
            },
            status=400,
        )

    wallet, _ = Wallet.objects.get_or_create(
        user=request.user
    )

    client = get_razorpay_client()

    try:

        order = client.order.create(
            {
                "amount": int(amount * 100),
                "currency": "INR",
                "receipt": (
                    f"wallet_{request.user.id}_"
                    f"{timezone.now().timestamp()}"
                ),
                "notes": {
                    "user_id": str(request.user.id),
                    "purpose": "wallet_topup",
                },
            }
        )

        WalletTopUp.objects.create(
            user=request.user,
            wallet=wallet,
            amount=amount,
            razorpay_order_id=order["id"],
            status="CREATED",
        )

        return Response(
            {
                "order_id": order["id"],
                "amount": int(amount * 100),
                "currency": "INR",
                "key": settings.RAZORPAY_KEY_ID,
            }
        )

    except Exception as e:

        print(
            "WALLET TOPUP ERROR:",
            str(e),
        )

        return Response(
            {"error": "Payment init failed"},
            status=500,
        )


# ============================================================
# VERIFY WALLET TOP-UP
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def verify_wallet_topup(request):

    order_id = request.data.get("order_id")
    payment_id = request.data.get("payment_id")
    signature = request.data.get("signature")

    if not all([
        order_id,
        payment_id,
        signature,
    ]):

        return Response(
            {"error": "Missing payment data"},
            status=400,
        )

    try:

        topup = (
            WalletTopUp.objects
            .select_for_update()
            .get(
                razorpay_order_id=order_id,
                user=request.user,
            )
        )

    except WalletTopUp.DoesNotExist:

        return Response(
            {
                "error": "Wallet top-up not found"
            },
            status=404,
        )

    # --------------------------------------------------------
    # IDEMPOTENCY
    # --------------------------------------------------------

    if topup.status == "SUCCESS":

        return Response(
            {
                "message": "Wallet already credited",
                "balance": str(
                    topup.wallet.balance
                ),
            }
        )

    client = get_razorpay_client()

    try:

        # ----------------------------------------------------
        # VERIFY RAZORPAY SIGNATURE
        # ----------------------------------------------------

        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            }
        )

        # ----------------------------------------------------
        # GET USER WALLET
        # ----------------------------------------------------

        wallet = (
            Wallet.objects
            .select_for_update()
            .get(
                user=request.user
            )
        )

        # ----------------------------------------------------
        # EXTRA IDEMPOTENCY PROTECTION
        # ----------------------------------------------------

        already_credited = (
            WalletTransaction.objects.filter(
                wallet=wallet,
                source="DEPOSIT",
                reference_id=order_id,
                transaction_type="CREDIT",
            ).exists()
        )

        if already_credited:

            topup.status = "SUCCESS"
            topup.razorpay_payment_id = payment_id
            topup.razorpay_signature = signature

            topup.save(
                update_fields=[
                    "status",
                    "razorpay_payment_id",
                    "razorpay_signature",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "message": "Wallet already credited",
                    "balance": str(
                        wallet.balance
                    ),
                }
            )

        # ----------------------------------------------------
        # CREDIT SERVER-SIDE AMOUNT
        # ----------------------------------------------------

        wallet.balance += topup.amount
        wallet.save()

        # ----------------------------------------------------
        # CREATE WALLET TRANSACTION
        # ----------------------------------------------------

        WalletTransaction.objects.create(
            wallet=wallet,
            amount=topup.amount,
            transaction_type="CREDIT",
            source="DEPOSIT",
            reference_id=order_id,
        )

        # ----------------------------------------------------
        # MARK TOP-UP SUCCESS
        # ----------------------------------------------------

        topup.razorpay_payment_id = payment_id
        topup.razorpay_signature = signature
        topup.status = "SUCCESS"

        topup.save(
            update_fields=[
                "razorpay_payment_id",
                "razorpay_signature",
                "status",
                "updated_at",
            ]
        )

        # ----------------------------------------------------
        # WALLET TOP-UP SUCCESS NOTIFICATION
        # ----------------------------------------------------

        try:

            print("🔥 WALLET TOPUP NOTIFICATION TRIGGER")

            notification_result = NotificationDispatcher.trigger(
                "WALLET_TOPUP_SUCCESS",
                topup,
                amount=topup.amount,
                metadata={
                    "route": "/wallet",
                    "topup_id": topup.id,
                    "payment_id": payment_id,
                },
            )

            print(
                "🔥 WALLET TOPUP NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ WALLET TOP-UP NOTIFICATION ERROR:",
                str(notification_error),
            )

        # ----------------------------------------------------
        # SUCCESS RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "message": "Wallet credited successfully",
                "amount": str(
                    topup.amount
                ),
                "balance": str(
                    wallet.balance
                ),
            }
        )

    except Exception as e:

        print(
            "WALLET VERIFY ERROR:",
            str(e),
        )

        topup.status = "FAILED"

        topup.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "error": "Payment verification failed"
            },
            status=400,
        )


    
# ============================================================
# SAVE / UPDATE BANK ACCOUNT
# ============================================================

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

    if not all([
        account_holder_name,
        bank_name,
        account_number,
        ifsc_code,
    ]):

        return Response(
            {
                "error": (
                    "Account holder name, bank name, "
                    "account number and IFSC code are required"
                )
            },
            status=400,
        )

    bank_account, created = (
        BankAccount.objects.update_or_create(
            user=user,
            defaults={
                "account_holder_name": account_holder_name,
                "bank_name": bank_name,
                "account_number": account_number,
                "ifsc_code": ifsc_code,
                "upi_id": upi_id,
            },
        )
    )

    return Response(
        {
            "message": (
                "Bank account saved successfully"
            ),
            "bank_account_id": bank_account.id,
        }
    )

# ============================================================
# WITHDRAW WALLET
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([
    CreatePaymentThrottle,
    WithdrawalThrottle,
])
@transaction.atomic
def withdraw_wallet(request):

    user = request.user

    # --------------------------------------------------------
    # GET AMOUNT
    # --------------------------------------------------------

    amount = request.data.get("amount")

    try:

        amount = Decimal(str(amount))

    except (TypeError, ValueError):

        return Response(
            {
                "error": "Invalid withdrawal amount"
            },
            status=400,
        )

    # --------------------------------------------------------
    # VALIDATE AMOUNT
    # --------------------------------------------------------

    if amount <= 0:

        return Response(
            {
                "error": "Amount must be positive"
            },
            status=400,
        )

    if amount < Decimal("10"):

        return Response(
            {
                "error": "Minimum withdrawal amount is ₹10"
            },
            status=400,
        )

    # --------------------------------------------------------
    # GET BANK ACCOUNT
    # --------------------------------------------------------

    try:

        bank_account = BankAccount.objects.get(
            user=user
        )

    except BankAccount.DoesNotExist:

        return Response(
            {
                "error": (
                    "Please add a bank account "
                    "before withdrawing"
                )
            },
            status=400,
        )

    # --------------------------------------------------------
    # GET USER WALLET
    # --------------------------------------------------------

    wallet = (
        Wallet.objects
        .select_for_update()
        .get(
            user=user
        )
    )

    # --------------------------------------------------------
    # CHECK WALLET BALANCE
    # --------------------------------------------------------

    if wallet.balance < amount:

        return Response(
            {
                "error": "Insufficient balance",
                "balance": str(
                    wallet.balance
                ),
                "requested": str(
                    amount
                ),
            },
            status=400,
        )

    # --------------------------------------------------------
    # DEBIT WALLET
    # --------------------------------------------------------

    wallet.balance -= amount
    wallet.save()

    # --------------------------------------------------------
    # CREATE WITHDRAWAL
    # --------------------------------------------------------

    withdrawal = Withdrawal.objects.create(
        user=user,
        amount=amount,
        bank_account=bank_account,
        status="PENDING",
    )

    # --------------------------------------------------------
    # CREATE WALLET TRANSACTION
    # --------------------------------------------------------

    WalletTransaction.objects.create(
        wallet=wallet,
        amount=amount,
        transaction_type="DEBIT",
        source="WITHDRAWAL",
        reference_id=str(
            withdrawal.id
        ),
    )

    # --------------------------------------------------------
    # WITHDRAWAL REQUEST NOTIFICATION
    # --------------------------------------------------------

    try:

        print(
            "🔥 WITHDRAWAL REQUEST NOTIFICATION TRIGGER"
        )

        notification_result = (
            NotificationDispatcher.trigger(
                "WALLET_WITHDRAW",
                withdrawal,
                amount=amount,
                metadata={
                    "route": "/wallet/withdrawals",
                    "withdrawal_id": withdrawal.id,
                    "amount": str(amount),
                    "status": withdrawal.status,
                },
            )
        )

        print(
            "🔥 WITHDRAWAL REQUEST NOTIFICATION COMPLETED:",
            notification_result,
        )

    except Exception as notification_error:

        print(
            "❌ WITHDRAWAL NOTIFICATION ERROR:",
            str(notification_error),
        )

    # --------------------------------------------------------
    # SUCCESS RESPONSE
    # --------------------------------------------------------

    return Response(
        {
            "message": "Withdrawal request submitted",
            "withdrawal_id": withdrawal.id,
            "status": withdrawal.status,
            "amount": str(amount),
            "wallet_balance": str(
                wallet.balance
            ),
        }
    )
# ============================================================
# MY WITHDRAWALS
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_withdrawals(request):

    withdrawals = (
        Withdrawal.objects
        .filter(
            user=request.user
        )
        .select_related(
            "bank_account"
        )
        .order_by(
            "-created_at"
        )
    )

    serializer = WithdrawalSerializer(
        withdrawals,
        many=True,
    )

    return Response(
        serializer.data
    )

# ============================================================
# OLD WITHDRAW FUNCTION
# ============================================================
# Do not use this function.
# withdraw_wallet above is the active wallet withdrawal API.
#
# The actual RazorpayX payout integration will be added
# separately after the wallet withdrawal flow is tested.

