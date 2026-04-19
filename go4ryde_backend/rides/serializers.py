from rest_framework import serializers
from django.utils.timezone import now
from .models import Ride
from bookings.serializers import BookingMiniSerializer


class RideSerializer(serializers.ModelSerializer):

    seats_remaining = serializers.SerializerMethodField()
    bookings = BookingMiniSerializer(many=True, read_only=True)

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
        ]

    # -------------------------
    # ✅ EXTRA FIELD
    # -------------------------
    def get_seats_remaining(self, obj):
        return obj.seats_remaining()

    # -------------------------
    # 🔥 VALIDATION (MERGED CLEAN)
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

        # ❌ Price validation
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
        return super().create(validated_data)