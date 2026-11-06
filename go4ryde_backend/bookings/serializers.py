from rest_framework import serializers
from decimal import Decimal

from bookings.models import Booking
from rides.models import Ride
from core.utils import get_platform_fee
from coupons.models import Coupon


class CreateBookingSerializer(serializers.ModelSerializer):
    coupon_code = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Booking
        fields = [
            "ride",
            "seats",
            "coupon_code",
        ]

    # -------------------------
    # ✅ VALIDATION
    # -------------------------
    def validate(self, data):
        ride = data.get("ride")
        seats = data.get("seats")

        if not ride:
            raise serializers.ValidationError({
                "ride": "Ride is required"
            })

        if ride.status not in ["ACTIVE", "CREATED", "SCHEDULED"]:
            raise serializers.ValidationError({
                "ride": f"Ride is {ride.status}"
            })

        if not seats or seats <= 0:
            raise serializers.ValidationError({
                "seats": "Invalid seats"
            })

        # DEBUG
        remaining = ride.seats_available - ride.seats_booked

        print("========== BOOKING DEBUG ==========")
        print("Ride:", ride.id)
        print("Status:", ride.status)
        print("Seats Requested:", seats)
        print("Seats Available:", ride.seats_available)
        print("Seats Booked:", ride.seats_booked)
        print("Remaining:", remaining)
        print("Can Book:", ride.can_book(seats))
        print("===================================")

        if not ride.can_book(seats):
            raise serializers.ValidationError({
                "seats": (
                    f"Requested {seats}, "
                    f"but only {remaining} seats remaining"
                )
            })

        return data
    # -------------------------
    # 🚀 CREATE BOOKING
    # -------------------------
    def create(self, validated_data):
        user = self.context["request"].user
        ride = validated_data["ride"]
        seats = validated_data["seats"]
        coupon_code = validated_data.get("coupon_code")

        # -------------------------
        # 💰 BASE PRICE
        # -------------------------
        base_amount = Decimal(ride.price_per_seat) * Decimal(seats)

        # -------------------------
        # 🏢 PLATFORM FEE
        # -------------------------
        fee_percent = Decimal(get_platform_fee())  # e.g. 10
        amount_with_fee = base_amount * (Decimal(1) + fee_percent / Decimal(100))

        discount = Decimal("0")
        final_amount = amount_with_fee

        # -------------------------
        # 🎟 APPLY COUPON (CORRECT LOGIC)
        # -------------------------
        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)

                # ✅ VALIDATION USING MODEL
                valid, message = coupon.is_valid(user, amount_with_fee)

                if not valid:
                    raise serializers.ValidationError(message)

                # ✅ APPLY DISCOUNT
                final_amount, discount = coupon.apply_discount(amount_with_fee)

                # ✅ TRACK USAGE
                coupon.mark_used(user)

            except Coupon.DoesNotExist:
                raise serializers.ValidationError("Invalid coupon")

        # -------------------------
        # ✅ CREATE BOOKING
        # -------------------------
        booking = Booking.objects.create(
            user=user,
            ride=ride,
            seats=seats,
            original_amount=round(amount_with_fee, 2),
            final_amount=round(final_amount, 2),
            status="PENDING",
            payment_status="PENDING"
        )

        return booking


# -------------------------
# 📦 MINI SERIALIZER
# -------------------------
class BookingMiniSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email")
    ride_id = serializers.IntegerField(source="ride.id", read_only=True)
    phone = serializers.CharField(
        source="user.phone",
        read_only=True
    )
    class Meta:
        model = Booking
        fields = [
            "id",
            "user_email",
            "phone",
            "seats",
            "status",
            "ride_id"
        ]


# -------------------------
# 📦 FULL SERIALIZER
# -------------------------
class BookingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email")
    ride_id = serializers.IntegerField(source="ride.id", read_only=True)
    ride = serializers.StringRelatedField()

    class Meta:
        model = Booking
        fields = [
            "id",
            "ride",
            "ride_id",
            "seats",
            "status",
            "payment_status",
            "final_amount",   # ✅ FIXED (was wrong: amount)
            "user_email"
        ]