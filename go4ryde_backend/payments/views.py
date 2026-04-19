import razorpay
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *


# -------------------------
# 🚀 CREATE PAYMENT
# -------------------------
@api_view(["POST"])
def create_payment(request):

    serializer = CreatePaymentSerializer(data=request.data, context={"request": request})

    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    booking = serializer.validated_data["booking"]

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    amount = int(booking.final_amount * 100)  # INR → paise

    try:
        order = client.order.create({
            "amount": amount,
            "currency": "INR",
            "payment_capture": 1
        })

        payment = Payment.objects.create(
            booking=booking,
            razorpay_order_id=order["id"],
            amount=booking.final_amount,
            status="CREATED"
        )

        return Response({
            "order_id": order["id"],
            "amount": amount,
            "key": settings.RAZORPAY_KEY_ID
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# -------------------------
# 🚀 VERIFY PAYMENT
# -------------------------
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def verify_payment(request):

    # ✅ HANDLE BOTH GET + POST
    data = request.query_params if request.method == "GET" else request.data

    order_id = data.get("order_id")
    payment_id = data.get("payment_id")
    signature = data.get("signature")

    # 🔥 DEBUG (VERY IMPORTANT)
    print("METHOD:", request.method)
    print("ORDER ID:", order_id)
    print("PAYMENT ID:", payment_id)
    print("SIGNATURE:", signature)

    # ❌ Missing data
    if not all([order_id, payment_id, signature]):
        print("❌ Missing payment data")
        return redirect("/payment/failed")

    client = razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )

    try:
        # 🔐 VERIFY SIGNATURE
        client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })

        payment = Payment.objects.get(razorpay_order_id=order_id)

        # ✅ UPDATE PAYMENT
        payment.razorpay_payment_id = payment_id
        payment.razorpay_signature = signature
        payment.status = "SUCCESS"
        payment.save()

        # ✅ UPDATE BOOKING
        booking = payment.booking
        booking.status = "ACCEPTED"
        booking.payment_status = "PAID"
        booking.save()

        print("✅ PAYMENT VERIFIED SUCCESS")

        return redirect("/payment/success")

    except Exception as e:
        print("❌ VERIFY ERROR:", str(e))

        try:
            payment = Payment.objects.get(razorpay_order_id=order_id)
            payment.status = "FAILED"
            payment.save()
        except:
            pass

        return redirect("/payment/failed")