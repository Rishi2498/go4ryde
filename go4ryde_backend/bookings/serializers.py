from rest_framework import serializers
from .models import Booking


class CreateBookingSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(required=False)
    seats = serializers.IntegerField()
    seats_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            "ride",
            "seats",
            "coupon_code",
            "seats_remaining"
        ]

    def get_seats_remaining(self, obj):
        return obj.seats_remaining()

    def validate(self, data):
        ride = data["ride"]
        seats = data["seats"]

        # ❌ Ride not active
        if ride.status != "ACTIVE":
            raise serializers.ValidationError("Ride is not available")

        # ❌ Not enough seats
        if not ride.can_book(seats):
            raise serializers.ValidationError("Not enough seats available")

        return data

class BookingMiniSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email")

    # 🔥 ADD THIS (VERY IMPORTANT)
    ride_id = serializers.IntegerField(source="ride.id", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user_email",
            "seats",
            "status",
            "ride_id"   # ✅ REQUIRED
        ]

class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email")

    # 🔥 CRITICAL FIELD
    ride_id = serializers.IntegerField(source="ride.id", read_only=True)

    # optional display
    ride = serializers.StringRelatedField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "ride",
            "ride_id",          # ✅ MUST
            "seats",
            "status",
            "payment_status",
            "amount",
            "user_email"
        ]