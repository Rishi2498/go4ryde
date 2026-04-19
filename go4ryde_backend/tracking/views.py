from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import random
from rides.models import Ride
from .models import DriverLocation, DriverLocationHistory


# 📍 DRIVER SEND LOCATION
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_location(request):

    ride_id = request.data.get("ride_id")
    lat = request.data.get("lat")
    lng = request.data.get("lng")

    # ✅ FIXED VALIDATION (important)
    if ride_id is None or lat is None or lng is None:
        return Response({"error": "Missing data"}, status=400)

    # ✅ TYPE CAST (prevents 500 error)
    try:
        ride_id = int(ride_id)
        lat = float(lat)
        lng = float(lng)
    except (ValueError, TypeError):
        return Response({"error": "Invalid data format"}, status=400)

    # 🔍 FETCH RIDE
    try:
        ride = Ride.objects.get(id=ride_id)
    except Ride.DoesNotExist:
        return Response({"error": "Ride not found"}, status=404)

    # 🔒 SECURITY CHECK
    if ride.driver != request.user:
        return Response({"error": "Not your ride"}, status=403)

    # 🚗 RIDE STATUS CHECK
    if ride.status != "ACTIVE":
        return Response({"error": "Ride not started"}, status=400)

    # ✅ UPDATE LIVE LOCATION (FAST ACCESS)
    DriverLocation.objects.update_or_create(
        ride=ride,
        defaults={
            "lat": lat,
            "lng": lng,
            "driver": request.user  # 🔥 new field
        }
    )
    if random.randint(1, 3) == 1:  # save only ~33%
    
    # ✅ SAVE HISTORY (OPTIONAL FREQUENCY CONTROL)
        DriverLocationHistory.objects.create(
            ride=ride,
            driver=request.user,
            lat=lat,
            lng=lng
    )

    return Response({"message": "Location updated successfully"})

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