from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import random
from rides.models import Ride
from tracking.models import DriverLocation, DriverLocationHistory
from django.shortcuts import get_object_or_404
from rest_framework.decorators import throttle_classes
from tracking.throttles import *
from django.core.cache import cache

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([DriverLocationUpdateThrottle])
def update_location(request):

    ride_id = request.data.get("ride_id")
    lat = request.data.get("lat")
    lng = request.data.get("lng")

    if ride_id is None or lat is None or lng is None:
        return Response({"error": "Missing data"}, status=400)

    try:
        ride_id = int(ride_id)
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        return Response({"error": "Invalid data format"}, status=400)

    ride = get_object_or_404(Ride, id=ride_id)

    if ride.driver != request.user:
        return Response({"error": "Not your ride"}, status=403)

    if ride.status != "ACTIVE":
        return Response({"error": "Ride not started"}, status=400)

    # 🔥 EXTRA PROTECTION (per-driver cooldown ~1 sec)
    cache_key = f"driver_loc_{request.user.id}"
    if cache.get(cache_key):
        return Response({"error": "Too many updates"}, status=429)

    cache.set(cache_key, True, timeout=1)

    # ✅ UPDATE LIVE LOCATION
    DriverLocation.objects.update_or_create(
        ride=ride,
        defaults={
            "lat": lat,
            "lng": lng,
            "driver": request.user
        }
    )

    # ✅ CONTROLLED HISTORY (1 in 3 writes)
    if random.randint(1, 3) == 1:
        DriverLocationHistory.objects.create(
            ride=ride,
            driver=request.user,
            lat=lat,
            lng=lng
        )

    return Response({"message": "Location updated"}, status=200)

@api_view(["GET"])
@permission_classes([])
@throttle_classes([DriverLocationReadThrottle])
def get_driver_location(request, ride_id):

    try:

        loc = DriverLocation.objects.select_related(
            "ride"
        ).get(
            ride_id=ride_id
        )

        return Response({
            "ride_id": loc.ride.id,
            "lat": loc.lat,
            "lng": loc.lng,
            "updated_at": loc.updated_at,
            "tracking_available": True
        })

    except DriverLocation.DoesNotExist:

        # 🚨 Debug
        print(
            f"❌ No DriverLocation found for Ride #{ride_id}"
        )

        # Temporary fallback
        ride = Ride.objects.filter(
            id=ride_id
        ).first()

        if not ride:

            return Response(
                {
                    "error": "Ride not found"
                },
                status=404
            )

        return Response({
            "ride_id": ride_id,

            # Hyderabad fallback
            "lat": 17.385044,
            "lng": 78.486671,

            "updated_at": None,

            "tracking_available": False,

            "message":
                "Driver location not available yet"
        })