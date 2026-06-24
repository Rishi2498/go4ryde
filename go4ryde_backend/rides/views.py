from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings
from bookings.views import add_user_to_chat
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
import requests
import logging
from django.shortcuts import get_object_or_404
from rides.models import Ride
from bookings.models import Booking
from rides.serializers import RideSerializer
from chat.models import ChatRoom
from bookings.models import Booking
from notifications.dispatcher import NotificationDispatcher
logger = logging.getLogger(__name__)


# -------------------------
# 🚀 RIDE VIEWSET
# -------------------------
class RideViewSet(viewsets.ModelViewSet):
    queryset = Ride.objects.all().prefetch_related("bookings")
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    # ✅ FIX 1: ONLY DRIVER CAN CREATE RIDE
    def create(self, request, *args, **kwargs):
        if request.user.role != "DRIVER":
            return Response({"error": "Only drivers can create rides"}, status=403)
        
        return super().create(request, *args, **kwargs)

    # -------------------------
    # 🔥 MY RIDES
    # -------------------------
    @action(detail=False, methods=["get"])
    def my_rides(self, request):

            rides = Ride.objects.filter(
                driver=request.user
            ).order_by("-created_at")

            data = []

            for ride in rides:

                bookings = Booking.objects.filter(
                    ride=ride,
                    status__in=["CONFIRMED", "ACCEPTED", "STARTED"]
                ).select_related("user")

                booked_users = [
                    {
                        "booking_id": booking.id,
                        "name": booking.user.email.split("@")[0],
                        "email": booking.user.email,
                        "phone": booking.user.phone,
                        "status": booking.status,
                    }
                    for booking in bookings
                ]

                data.append({
                    "id": ride.id,
                    "source": ride.source,
                    "destination": ride.destination,
                    "date_time": ride.date_time,
                    "price_per_seat": ride.price_per_seat,
                    "status": ride.status,
                    "bookings_count": bookings.count(),
                    "booked_users_phone": [booking.user.phone for booking in bookings],
                    "booked_users": booked_users,
                })

            return Response(data)

    # -------------------------
    # 🔍 SEARCH RIDES
    # -------------------------
    @action(detail=False, methods=["post"], url_path="search")
    def search(self, request):
        rides = Ride.objects.exclude(status="COMPLETED").order_by("-created_at")
        rides = [ride for ride in rides if ride.seats_remaining() > 0]
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
                "seats_remaining": r.seats_remaining(),
                # "seats_remaining": getattr(r, "available_seats", 0),
                "route_geometry": r.route_geometry,
                "status": r.status,
                "date_time": r.date_time,
            }
            for r in rides
        ]

        return Response(data)

    # -------------------------
    # 🚀 CREATE RIDE + CHAT ROOM
    # -------------------------
    @transaction.atomic
    def perform_create(self, serializer):
        # ✅ Create ride
        ride = serializer.save(driver=self.request.user)

        # ❌ REMOVE THIS BLOCK (WRONG ARCHITECTURE)
        # room = ChatRoom.objects.create(ride=ride)
        # room.participants.add(ride.driver)

        print("🚗 RIDE CREATED BY DRIVER:", ride.driver.id)

        # -------------------------
        # 📍 ROUTE CALCULATION
        # -------------------------
        if not all([
            ride.source_lat,
            ride.source_lng,
            ride.destination_lat,
            ride.destination_lng
        ]):
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
            ride.route_geometry = res["routes"][0].get("overview_polyline", {}).get("points")

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

    # ✅ FIX: VALIDATION
    if not source or not destination:
        return Response({"error": "Missing source/destination"}, status=400)

    if not isinstance(source, dict) or not isinstance(destination, dict):
        return Response({"error": "Invalid format"}, status=400)

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
# ✅ ACCEPT BOOKING
# -------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_booking(request, booking_id):

    booking = get_object_or_404(
        Booking.objects.select_related("ride"),
        id=booking_id
    )

    ride = booking.ride
    print("========== ACCEPT BOOKING ==========")
    print("BOOKING ID:", booking.id)
    print("BOOKING STATUS:", booking.status)
    print("PAYMENT STATUS:", booking.payment_status)
    print("RIDE DRIVER:", ride.driver.id)
    print("REQUEST USER:", request.user.id)
    print("SEATS:", booking.seats)
    print("SEATS BOOKED:", ride.seats_booked)
    print("TOTAL SEATS:", ride.total_seats)
    # ❌ Not driver
    if ride.driver != request.user:
        return Response({"error": "Not your ride"}, status=403)

    # ❌ Payment check
    if booking.payment_status not in [
        "PAID",
        "PARTIALLY_PAID",
        "Cash"
    ]:
        return Response(
            {"error": "Payment not completed"},
            status=400
        )
    if not ride.can_book(booking.seats):
        return Response(
        {"error": "Seats no longer available"},
        status=400
    )

    # ✅ Confirm booking
    booking.status = "CONFIRMED"
    booking.save()

    ride.seats_booked += booking.seats

    print("BEFORE SAVE:", ride.seats_booked)

    ride.save()

    ride.refresh_from_db()

    print("AFTER SAVE:", ride.seats_booked)

    # 🔥 FINAL CHAT FIX (IMPORTANT)
    room, _ = ChatRoom.objects.get_or_create(ride=ride)

    # ✅ ADD BOTH USERS (THIS FIXES YOUR BUG)
    room.participants.add(ride.driver)
    room.participants.add(booking.user)
     
    print("🔥 FINAL USERS:", list(room.participants.values_list("email", flat=True)))

    return Response({"message": "Booking accepted & chat enabled"})
 
# -------------------------
# 🚗 START RIDE
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ride(request, booking_id):

    booking = Booking.objects.select_related(
        "ride"
    ).get(
        id=booking_id
    )

    ride = booking.ride

    # ❌ NOT DRIVER
    if ride.driver != request.user:

        return Response(
            {"error": "Not your ride"},
            status=403
        )

    # ❌ PARTIAL PAYMENT NOT ALLOWED
    if booking.payment_status not in [
        "PAID",
        "Cash"
    ]:

        return Response(
            {
                "error":
                "Passenger must complete remaining payment before ride can start"
            },
            status=400
        )

    # ❌ BOOKING NOT CONFIRMED
    if booking.status != "CONFIRMED":

        return Response(
            {
                "error":
                "Booking must be confirmed first"
            },
            status=400
        )

    # ✅ START BOOKING
    booking.status = "STARTED"
    booking.save()

    # ✅ START RIDE
    ride.status = "ACTIVE"
    ride.save()

    # 🔔 NOTIFY ALL CONFIRMED PASSENGERS
    for passenger_booking in ride.bookings.filter(
        status__in=[
            "CONFIRMED",
            "STARTED"
        ]
    ):

        NotificationDispatcher.trigger(
            "RIDE_STARTED",
            passenger_booking,
            source=ride.source,
            destination=ride.destination,
            metadata={
                "route":
                f"/tracking/{ride.id}"
            }
        )

    return Response({
        "success": True,
        "message": "Ride started 🚗"
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_ride(request, booking_id):

    booking = Booking.objects.select_related(
        "ride"
    ).get(id=booking_id)

    ride = booking.ride

    if ride.driver != request.user:

        return Response(
            {"error": "Not your ride"},
            status=403
        )

    if ride.status != "ACTIVE":

        return Response(
            {"error": "Ride is not active"},
            status=400
        )

    started_bookings = ride.bookings.filter(
        status="STARTED"
    )

    ride.status = "COMPLETED"
    ride.save()

    started_bookings.update(
        status="COMPLETED"
    )

    for passenger_booking in started_bookings:

        NotificationDispatcher.trigger(
            "RIDE_COMPLETED",
            passenger_booking,
            source=ride.source,
            destination=ride.destination,
                metadata={
                    "route": f"/ride/{ride.id}"
                }
        )

    return Response(
        {"message": "Ride completed ✅"}
    )