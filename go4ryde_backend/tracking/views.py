from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import random
from rides.models import Ride
from tracking.models import DriverLocation, DriverLocationHistory
from django.shortcuts import get_object_or_404

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_location(request):

    ride_id = request.data.get("ride_id")
    lat = request.data.get("lat")
    lng = request.data.get("lng")

    # ✅ VALIDATION
    if ride_id is None or lat is None or lng is None:
        return Response({"error": "Missing data"}, status=400)

    # ✅ TYPE CAST
    try:
        ride_id = int(ride_id)
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        return Response({"error": "Invalid data format"}, status=400)

    # ✅ FETCH RIDE (SAFE)
    ride = get_object_or_404(Ride, id=ride_id)

    # 🔒 AUTH CHECK
    if ride.driver != request.user:
        return Response({"error": "Not your ride"}, status=403)

    # 🚗 STATUS CHECK
    if ride.status != "ACTIVE":
        return Response({"error": "Ride not started"}, status=400)

    # ✅ UPDATE LIVE LOCATION
    DriverLocation.objects.update_or_create(
        ride=ride,
        defaults={
            "lat": lat,
            "lng": lng,
            "driver": request.user
        }
    )

    # ✅ SAVE HISTORY (controlled frequency)
    if random.randint(1, 3) == 1:
        DriverLocationHistory.objects.create(
            ride=ride,
            driver=request.user,
            lat=lat,
            lng=lng
        )

    return Response({"message": "Location updated successfully"}, status=200)


@api_view(["GET"])
def get_driver_location(request, ride_id):

    try:
        loc = DriverLocation.objects.select_related("ride").get(ride_id=ride_id)

        return Response({
            "ride_id": loc.ride.id,
            "lat": loc.lat,
            "lng": loc.lng,
            "updated_at": loc.updated_at
        })

    except DriverLocation.DoesNotExist:
        return Response({"error": "Location not available"}, status=404)