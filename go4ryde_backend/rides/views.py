from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
import requests
import logging

from rides.models import Ride
from bookings.models import Booking
from rides.serializers import RideSerializer

from chat.models import ChatRoom  # ✅ NEW

logger = logging.getLogger(__name__)


# -------------------------
# 🚀 VIEWSET
# -------------------------
class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.all().prefetch_related("bookings")
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    # -------------------------
    # 🔥 MY RIDES
    # -------------------------
    @action(detail=False, methods=["get"])
    def my_rides(self, request):
        rides = Ride.objects.filter(driver=request.user).order_by("-created_at")
        serializer = self.get_serializer(rides, many=True)
        return Response(serializer.data)

     # 🔥 SEARCH RIDES (ADD THIS)
    # @action(detail=False, methods=["post"], url_path="search")
    # def search(self, request):


    @action(detail=False, methods=["post"], url_path="search")
    def search(self, request):
        """
        🔥 TEMP: Return ALL rides (no filtering)
        Scalable later
        """

        rides = Ride.objects.all().order_by("-created_at")

        data = [
            {
                "id": r.id,
                "source": r.source,
                "destination": r.destination,

                "source_lat": r.source_lat,
                "source_lng": r.source_lng,
                "destination_lat": r.destination_lat,
                "destination_lng": r.destination_lng,

                "price_per_seat": r.price_per_seat,
                "distance_km": r.distance_km,
                "duration_min": r.duration_min,

                "seats_remaining": getattr(r, "available_seats", 0),

                "route_geometry": r.route_geometry,
                "status": r.status,
                "date_time": r.date_time,
            }
            for r in rides
        ]

        return Response(data)
    #     source_lat = request.data.get("source_lat")
    #     source_lng = request.data.get("source_lng")
    #     destination_lat = request.data.get("destination_lat")
    #     destination_lng = request.data.get("destination_lng")

    #     if not source_lat or not source_lng:
    #         return Response({"error": "Missing source"}, status=400)

    #     # 🚗 BASIC FILTER (you can improve later)
    #         rides = Ride.objects.all().order_by("-created_at")  # 🔥 NO FILTER
    #   # 🔥 OPTIONAL: nearest logic (simple)
    #     # For now just return all active rides

    #     serializer = self.get_serializer(rides, many=True)
    #     return Response(serializer.data)
    # -------------------------
    # 🚀 CREATE RIDE + CHAT ROOM
    # -------------------------
    @transaction.atomic
    def perform_create(self, serializer):
        ride = serializer.save(driver=self.request.user)

        # ✅ CREATE CHAT ROOM (CRITICAL)
        room = ChatRoom.objects.create(ride=ride)
        room.participants.add(ride.driver)

        # -------------------------
        # 📍 ROUTE CALCULATION
        # -------------------------
        if not all([
            ride.source_lat,
            ride.source_lng,
            ride.destination_lat,
            ride.destination_lng
        ]):
            logger.warning("Missing coordinates")
            return

        try:
            res = requests.get(
                "https://maps.googleapis.com/maps/api/directions/json",
                params={
                    "origin": f"{ride.source_lat},{ride.source_lng}",
                    "destination": f"{ride.destination_lat},{ride.destination_lng}",
                    "key": settings.GOOGLE_MAPS_API_KEY
                },
                timeout=10
            ).json()

            if res.get("status") != "OK":
                logger.error(res)
                return

            route = res["routes"][0]["legs"][0]

            ride.distance_km = round(route["distance"]["value"] / 1000, 2)
            ride.duration_min = round(route["duration"]["value"] / 60, 2)

            ride.route_geometry = res["routes"][0].get(
                "overview_polyline", {}
            ).get("points")

            if not ride.price_per_seat:
                ride.price_per_seat = round(50 + (ride.distance_km * 10), 2)

            ride.save()

        except Exception as e:
            logger.error(str(e))


# -------------------------
# 📍 ROUTE PREVIEW
# -------------------------
@api_view(["POST"])
def calculate_route(request):

    source = request.data.get("source")
    destination = request.data.get("destination")

    if not source or not destination:
        return Response({"error": "Missing source/destination"}, status=400)

    try:
        res = requests.get(
            "https://maps.googleapis.com/maps/api/directions/json",
            params={
                "origin": f"{source['lat']},{source['lng']}",
                "destination": f"{destination['lat']},{destination['lng']}",
                "key": settings.GOOGLE_MAPS_API_KEY
            }
        ).json()

        route = res["routes"][0]["legs"][0]

        distance = route["distance"]["value"] / 1000
        duration = route["duration"]["value"] / 60

        return Response({
            "distance": round(distance, 2),
            "duration": round(duration, 2),
            "price": round(50 + distance * 10, 2)
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# -------------------------
# ✅ ACCEPT BOOKING + CHAT ENABLE
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_booking(request, booking_id):

    booking = Booking.objects.select_related("ride").get(id=booking_id)

    if booking.ride.driver != request.user:
        return Response({"error": "Not your ride"}, status=403)

    # 🔥 ONLY IF PAID
    if booking.payment_status != "PAID":
        return Response({"error": "Payment not completed"}, status=400)

    # ✅ UPDATE STATUS (IMPORTANT CHANGE)
    booking.status = "CONFIRMED"
    booking.save()

    # ✅ ADD PASSENGER TO CHAT ROOM
    room, _ = ChatRoom.objects.get_or_create(ride=booking.ride)
    room.participants.add(booking.user)

    return Response({"message": "Booking accepted & chat enabled ✅"})


# -------------------------
# 🚗 START RIDE
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ride(request, booking_id):

    booking = Booking.objects.select_related("ride").get(id=booking_id)

    if booking.ride.driver != request.user:
        return Response({"error": "Not your ride"}, status=403)

    if booking.status != "CONFIRMED":  # ✅ UPDATED
        return Response({"error": "Booking must be confirmed first"}, status=400)

    booking.status = "STARTED"
    booking.save()

    ride = booking.ride
    ride.status = "ACTIVE"
    ride.save()

    return Response({"message": "Ride started 🚗"})