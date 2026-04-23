from rest_framework import serializers
from bookings.models import Booking


# -------------------------
# 🚀 CREATE PAYMENT
# -------------------------
class CreatePaymentSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context["request"].user

        try:
            booking = Booking.objects.get(id=data["booking_id"], user=user)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Invalid booking")

        # ❌ Already paid
        if booking.payment_status == "PAID":
            raise serializers.ValidationError("Payment already completed")

        # ❌ Cancelled booking
        if booking.status == "CANCELLED":
            raise serializers.ValidationError("Booking cancelled")

        data["booking"] = booking
        return data


# -------------------------
# 🚀 VERIFY PAYMENT
# -------------------------
class VerifyPaymentSerializer(serializers.Serializer):
    order_id = serializers.CharField()
    payment_id = serializers.CharField()
    signature = serializers.CharField()

    def validate(self, data):
        if not all([data.get("order_id"), data.get("payment_id"), data.get("signature")]):
            raise serializers.ValidationError("Invalid payment data")

        return data