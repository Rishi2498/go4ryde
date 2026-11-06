
import random

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from rides.models import Ride
from tracking.models import DriverLocation, DriverLocationHistory
from tracking.throttles import (
    DriverLocationReadThrottle,
    DriverLocationUpdateThrottle,
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([DriverLocationUpdateThrottle])
def update_location(request):
    ride_id = request.data.get("ride_id")
    lat = request.data.get("lat")
    lng = request.data.get("lng")

    if ride_id is None or lat is None or lng is None:
        return Response(
            {"error": "ride_id, lat and lng are required"},
            status=400,
        )

    try:
        ride_id = int(ride_id)
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        return Response({"error": "Invalid data format"}, status=400)

    if not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return Response({"error": "Invalid GPS coordinates"}, status=400)

    ride = get_object_or_404(Ride, id=ride_id)

    if ride.driver_id != request.user.id:
        return Response({"error": "Not your ride"}, status=403)

    if ride.status != "ACTIVE":
        return Response({"error": "Ride is not active"}, status=400)

    # Limit updates to approximately one per second per driver.
    cache_key = f"driver_loc_{request.user.id}"

    if cache.get(cache_key):
        return Response({"error": "Too many updates"}, status=429)

    cache.set(cache_key, True, timeout=1)

    # Persist the latest real driver location.
    DriverLocation.objects.update_or_create(
        ride=ride,
        defaults={
            "lat": lat,
            "lng": lng,
            "driver": request.user,
        },
    )

    # Save only a sample of location history.
    if random.randint(1, 3) == 1:
        DriverLocationHistory.objects.create(
            ride=ride,
            driver=request.user,
            lat=lat,
            lng=lng,
        )

    # Broadcast to clients connected to this ride's tracking socket.
    channel_layer = get_channel_layer()

    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            f"ride_{ride_id}",
            {
                "type": "send_location",
                "ride_id": ride_id,
                "lat": lat,
                "lng": lng,
            },
        )

    return Response(
        {
            "message": "Location updated",
            "ride_id": ride_id,
            "lat": lat,
            "lng": lng,
        },
        status=200,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([DriverLocationReadThrottle])
def get_driver_location(request, ride_id):
    ride = get_object_or_404(Ride, id=ride_id)

    # Do not expose a driver's location to unrelated users.
    if ride.driver_id != request.user.id:
        from tracking.access import can_access_ride

        if not can_access_ride(request.user, ride_id):
            return Response({"error": "Not authorized"}, status=403)

    try:
        loc = DriverLocation.objects.get(ride_id=ride_id)
    except DriverLocation.DoesNotExist:
        return Response(
            {
                "ride_id": ride_id,
                "tracking_available": False,
                "message": "Driver location is not available yet",
            },
            status=200,
        )

    return Response(
        {
            "ride_id": ride_id,
            "lat": loc.lat,
            "lng": loc.lng,
            "updated_at": loc.updated_at,
            "tracking_available": True,
        },
        status=200,
    )
