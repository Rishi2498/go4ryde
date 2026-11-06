from rest_framework import serializers
from django.utils.timezone import now
from decimal import Decimal, ROUND_HALF_UP
from rides.models import Ride
from bookings.serializers import BookingMiniSerializer
from core.utils import get_platform_fee

# 🔥 NEW IMPORT
try:
    from core.models import PlatformFee
except:
    PlatformFee = None


class RideSerializer(serializers.ModelSerializer):

    seats_remaining = serializers.SerializerMethodField()
    bookings = BookingMiniSerializer(many=True, read_only=True)

    # 🔥 NEW FIELD (IMPORTANT)
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = "__all__"
        read_only_fields = [
            "driver",
            "distance_km",
            "duration_min",
            "route_geometry",
            "seats_booked",
            "status",
            "bookings.phone",
        ]

    # -------------------------
    # ✅ SEATS REMAINING
    # -------------------------
    def get_seats_remaining(self, obj):
        return obj.seats_remaining()

    # -------------------------
    # 🔥 FINAL PRICE (ADMIN %)
    # -------------------------
    def get_final_price(self, obj):
        try:
            fee = PlatformFee.objects.first() if PlatformFee else None
            percent = fee.percentage if fee else 0
        except:
            percent = 0

        final = obj.price_per_seat * Decimal(1 + percent / 100)

        return round(final, 2)

    # -------------------------
    # 🔥 VALIDATION
    # -------------------------
    def validate(self, data):

        source = (data.get("source") or "").strip()
        destination = (data.get("destination") or "").strip()

        source_lat = data.get("source_lat")
        source_lng = data.get("source_lng")
        destination_lat = data.get("destination_lat")
        destination_lng = data.get("destination_lng")

        # ❌ Required fields
        if not source:
            raise serializers.ValidationError({"source": "Source is required"})

        if not destination:
            raise serializers.ValidationError({"destination": "Destination is required"})

        # ❌ Same location
        if source.lower() == destination.lower():
            raise serializers.ValidationError({
                "destination": "Source and destination cannot be the same"
            })

        # ❌ Coordinates required
        if not all([source_lat, source_lng, destination_lat, destination_lng]):
            raise serializers.ValidationError({
                "location": "Select location from suggestions (lat/lng required)"
            })

        # ❌ Future date
        if data.get("date_time") and data["date_time"] <= now():
            raise serializers.ValidationError({
                "date_time": "Ride must be scheduled in the future"
            })

        # ❌ Seats validation
        seats = data.get("seats_available")
        if seats is None or int(seats) <= 0:
            raise serializers.ValidationError({
                "seats_available": "Seats must be greater than 0"
            })

        # ❌ Price validation (DRIVER PRICE ONLY)
        price = data.get("price_per_seat")
        if price is not None:
            try:
                price = float(price)
                if price <= 0:
                    raise serializers.ValidationError({
                        "price_per_seat": "Price must be positive"
                    })
            except:
                raise serializers.ValidationError({
                    "price_per_seat": "Invalid price format"
                })

        return data

    # -------------------------
    # 🚀 CREATE
    # -------------------------
    def create(self, validated_data):
        base_price = validated_data.get("price_per_seat")

        if base_price:
            base_price = Decimal(base_price)
            fee = Decimal(get_platform_fee())

            final_price = base_price * (Decimal(1) + fee / Decimal(100))

            validated_data["price_per_seat"] = final_price.quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )

        return super().create(validated_data)
    
class RideDetailSerializer(serializers.ModelSerializer):

    seats_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Ride
        fields = "__all__"

    def get_seats_remaining(self, obj):
        return obj.seats_remaining()