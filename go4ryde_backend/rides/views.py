from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated

import requests
import logging

from bookings.views import add_user_to_chat
from payments.models import Payment
from rides.models import Ride
from bookings.models import Booking
from rides.serializers import RideSerializer
from chat.models import ChatRoom
from notifications.dispatcher import NotificationDispatcher


logger = logging.getLogger(__name__)


# =========================================================
# 🚀 RIDE VIEWSET
# =========================================================

class RideViewSet(viewsets.ModelViewSet):

    queryset = Ride.objects.all().prefetch_related("bookings")
    serializer_class = RideSerializer
    permission_classes = [permissions.IsAuthenticated]

    # =====================================================
    # ONLY DRIVER CAN CREATE RIDE
    # =====================================================

    def create(self, request, *args, **kwargs):

        if request.user.role != "DRIVER":
            return Response(
                {"error": "Only drivers can create rides"},
                status=403
            )

        return super().create(request, *args, **kwargs)

    # =====================================================
    # 🔥 MY RIDES
    # =====================================================

    @action(detail=False, methods=["get"])
    def my_rides(self, request):

        rides = Ride.objects.filter(
            driver=request.user
        ).order_by("-created_at")

        data = []

        for ride in rides:

            bookings = Booking.objects.filter(
                ride=ride,
                status__in=[
                    "PENDING",
                    "CONFIRMED",
                    "ACCEPTED",
                    "STARTED",
                ]
            ).select_related("user")

            booked_users = [
                {
                    "booking_id": booking.id,
                    "name": booking.user.email.split("@")[0],
                    "email": booking.user.email,
                    "phone": booking.user.phone,
                    "status": booking.status,

                    "payment_type": (
                        Payment.objects
                        .filter(booking=booking)
                        .order_by("-id")
                        .values_list(
                            "payment_type",
                            flat=True
                        )
                        .first()
                    ),
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
                "booked_users_phone": [
                    booking.user.phone
                    for booking in bookings
                ],
                "booked_users": booked_users,
            })

        return Response(data)

    # =====================================================
    # 🔍 SEARCH RIDES
    # =====================================================

    @action(
        detail=False,
        methods=["post"],
        url_path="search"
    )
    def search(self, request):

        rides = (
            Ride.objects
            .exclude(status="COMPLETED")
            .order_by("-created_at")
        )

        rides = [
            ride
            for ride in rides
            if ride.seats_remaining() > 0
        ]

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

                "route_geometry": r.route_geometry,

                "status": r.status,
                "date_time": r.date_time,
            }
            for r in rides
        ]

        return Response(data)

    # =====================================================
    # 🚀 CREATE RIDE + ROUTE CALCULATION
    # =====================================================

    @transaction.atomic
    def perform_create(self, serializer):

        # Create ride
        ride = serializer.save(
            driver=self.request.user
        )

        print(
            "🚗 RIDE CREATED BY DRIVER:",
            ride.driver.id
        )

        # =================================================
        # 📍 ROUTE CALCULATION
        # =================================================

        if not all([
            ride.source_lat,
            ride.source_lng,
            ride.destination_lat,
            ride.destination_lng,
        ]):
            return

        try:

            res = requests.get(
                "https://maps.googleapis.com/maps/api/directions/json",
                params={
                    "origin": (
                        f"{ride.source_lat},"
                        f"{ride.source_lng}"
                    ),
                    "destination": (
                        f"{ride.destination_lat},"
                        f"{ride.destination_lng}"
                    ),
                    "key": settings.GOOGLE_MAPS_API_KEY,
                },
                timeout=10,
            ).json()

            if res.get("status") != "OK":

                logger.error(res)

                return

            route = (
                res["routes"][0]["legs"][0]
            )

            ride.distance_km = round(
                route["distance"]["value"] / 1000,
                2
            )

            ride.duration_min = round(
                route["duration"]["value"] / 60,
                2
            )

            ride.route_geometry = (
                res["routes"][0]
                .get("overview_polyline", {})
                .get("points")
            )

            if not ride.price_per_seat:

                ride.price_per_seat = round(
                    50 + (
                        ride.distance_km * 10
                    ),
                    2
                )

            ride.save()

        except Exception as e:

            logger.error(str(e))


# =========================================================
# 📍 ROUTE PREVIEW
# =========================================================

@api_view(["POST"])
def calculate_route(request):

    source = request.data.get("source")
    destination = request.data.get("destination")

    # Validation

    if not source or not destination:

        return Response(
            {
                "error":
                "Missing source/destination"
            },
            status=400
        )

    if (
        not isinstance(source, dict)
        or not isinstance(destination, dict)
    ):

        return Response(
            {
                "error":
                "Invalid format"
            },
            status=400
        )

    try:

        res = requests.get(
            "https://maps.googleapis.com/maps/api/directions/json",
            params={
                "origin": (
                    f"{source['lat']},"
                    f"{source['lng']}"
                ),
                "destination": (
                    f"{destination['lat']},"
                    f"{destination['lng']}"
                ),
                "key": settings.GOOGLE_MAPS_API_KEY,
            }
        ).json()

        route = (
            res["routes"][0]["legs"][0]
        )

        distance = (
            route["distance"]["value"]
            / 1000
        )

        duration = (
            route["duration"]["value"]
            / 60
        )

        return Response({
            "distance": round(
                distance,
                2
            ),

            "duration": round(
                duration,
                2
            ),

            "price": round(
                50 + distance * 10,
                2
            ),
        })

    except Exception as e:

        return Response(
            {
                "error": str(e)
            },
            status=500
        )


# =========================================================
# 🔎 GOOGLE PLACES SEARCH
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def place_search(request):

    query = request.query_params.get("query", "").strip()

    if not query:
        return Response(
            {"results": []},
            status=200
        )

    try:
        response = requests.get(
            "https://maps.googleapis.com/maps/api/place/autocomplete/json",
            params={
                "input": query,
                "key": settings.GOOGLE_MAPS_API_KEY,
                "language": "en",
                "components": "country:in",
            },
            timeout=10,
        )

        data = response.json()

        if data.get("status") not in ["OK", "ZERO_RESULTS"]:
            logger.error(
                "GOOGLE PLACES ERROR: %s",
                data
            )

            return Response(
                {
                    "error": data.get(
                        "error_message",
                        data.get("status")
                    ),
                    "results": [],
                },
                status=400
            )

        results = []

        for prediction in data.get(
            "predictions",
            []
        ):

            results.append({
                "place_id": prediction.get(
                    "place_id"
                ),
                "description": prediction.get(
                    "description"
                ),
                "main_text": prediction.get(
                    "structured_formatting",
                    {}
                ).get(
                    "main_text"
                ),
                "secondary_text": prediction.get(
                    "structured_formatting",
                    {}
                ).get(
                    "secondary_text"
                ),
            })

        return Response({
            "results": results
        })

    except requests.RequestException as e:

        logger.error(
            "PLACES REQUEST ERROR: %s",
            str(e)
        )

        return Response(
            {
                "error":
                    "Unable to connect to Google Places",
                "results": [],
            },
            status=503
        )

    except Exception as e:

        logger.error(
            "PLACE SEARCH ERROR: %s",
            str(e)
        )

        return Response(
            {
                "error": str(e),
                "results": [],
            },
            status=500
        )


# =========================================================
# 📍 GOOGLE PLACE DETAILS
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def place_details(request):

    place_id = request.query_params.get(
        "place_id",
        ""
    ).strip()

    if not place_id:

        return Response(
            {
                "error":
                    "place_id is required"
            },
            status=400
        )

    try:

        response = requests.get(
            "https://maps.googleapis.com/maps/api/place/details/json",
            params={
                "place_id": place_id,
                "key": settings.GOOGLE_MAPS_API_KEY,
                "language": "en",
                "fields": (
                    "place_id,"
                    "name,"
                    "formatted_address,"
                    "geometry"
                ),
            },
            timeout=10,
        )

        data = response.json()

        if data.get("status") != "OK":

            logger.error(
                "GOOGLE PLACE DETAILS ERROR: %s",
                data
            )

            return Response(
                {
                    "error": data.get(
                        "error_message",
                        data.get("status")
                    )
                },
                status=400
            )

        result = data.get(
            "result",
            {}
        )

        geometry = result.get(
            "geometry",
            {}
        )

        location = geometry.get(
            "location",
            {}
        )

        return Response({
            "place_id": result.get(
                "place_id"
            ),
            "name": result.get(
                "name"
            ),
            "address": result.get(
                "formatted_address"
            ),
            "latitude": location.get(
                "lat"
            ),
            "longitude": location.get(
                "lng"
            ),
        })

    except requests.RequestException as e:

        logger.error(
            "PLACE DETAILS REQUEST ERROR: %s",
            str(e)
        )

        return Response(
            {
                "error":
                    "Unable to connect to Google Places"
            },
            status=503
        )

    except Exception as e:

        logger.error(
            "PLACE DETAILS ERROR: %s",
            str(e)
        )

        return Response(
            {
                "error": str(e)
            },
            status=500
        )


# =========================================================
# 📍 REVERSE GEOCODING
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def reverse_geocode(request):

    latitude = request.query_params.get(
        "latitude"
    )

    longitude = request.query_params.get(
        "longitude"
    )

    if latitude is None or longitude is None:

        return Response(
            {
                "error":
                    "latitude and longitude are required"
            },
            status=400
        )

    try:

        response = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json",
            params={
                "latlng":
                    f"{latitude},{longitude}",
                "key":
                    settings.GOOGLE_MAPS_API_KEY,
                "language":
                    "en",
            },
            timeout=10,
        )

        data = response.json()

        if data.get("status") != "OK":

            return Response(
                {
                    "error": data.get(
                        "error_message",
                        data.get("status")
                    )
                },
                status=400
            )

        results = data.get(
            "results",
            []
        )

        if not results:

            return Response(
                {
                    "address": ""
                }
            )

        return Response({
            "address":
                results[0].get(
                    "formatted_address",
                    ""
                ),
        })

    except requests.RequestException as e:

        logger.error(
            "REVERSE GEOCODE REQUEST ERROR: %s",
            str(e)
        )

        return Response(
            {
                "error":
                    "Unable to connect to Google"
            },
            status=503
        )

    except Exception as e:

        logger.error(
            "REVERSE GEOCODE ERROR: %s",
            str(e)
        )

        return Response(
            {
                "error": str(e)
            },
            status=500
        )

    
# =========================================================
# ✅ ACCEPT BOOKING
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_booking(request, booking_id):

    booking = get_object_or_404(
        Booking.objects.select_related("ride"),
        id=booking_id
    )

    ride = booking.ride

    print(
        "========== ACCEPT BOOKING =========="
    )

    print(
        "BOOKING ID:",
        booking.id
    )

    print(
        "BOOKING STATUS:",
        booking.status
    )

    print(
        "PAYMENT STATUS:",
        booking.payment_status
    )

    print(
        "RIDE DRIVER:",
        ride.driver.id
    )

    print(
        "REQUEST USER:",
        request.user.id
    )

    print(
        "SEATS:",
        booking.seats
    )

    print(
        "SEATS BOOKED:",
        ride.seats_booked
    )

    # =====================================================
    # DRIVER CHECK
    # =====================================================

    if ride.driver != request.user:

        return Response(
            {
                "error":
                "Not your ride"
            },
            status=403
        )

    # =====================================================
    # PAYMENT CHECK
    # =====================================================

    is_cod = Payment.objects.filter(
        booking=booking,
        payment_type="COD"
    ).exists()

    if (
        booking.payment_status not in [
            "PAID",
            "PARTIALLY_PAID",
            "Cash",
        ]
        and not is_cod
    ):

        return Response(
            {
                "error":
                "Payment not completed"
            },
            status=400
        )

    # =====================================================
    # ALREADY CONFIRMED
    #
    # Important:
    # A previous request may have already changed
    # the booking to CONFIRMED before an error happened.
    #
    # Do NOT reserve the seats again.
    #
    # We now finalize the status as ACCEPTED.
    # =====================================================

    if booking.status == "CONFIRMED":

        # The booking was already processed before.
        # Do NOT add the seats again.

        booking.status = "ACCEPTED"

        booking.save(
            update_fields=["status"]
        )

        room, created = (
            ChatRoom.objects.get_or_create(
                booking=booking,
                defaults={
                    "driver": ride.driver,
                    "passenger": booking.user,
                },
            )
        )

        print(
            "✅ BOOKING STATUS UPDATED:",
            booking.status
        )

        print(
            "💬 CHAT ROOM:",
            room.id
        )

        print(
            "💬 CHAT ROOM CREATED:",
            created
        )

        return Response({
            "message":
            "Booking accepted & chat enabled"
        })

    # =====================================================
    # ALREADY ACCEPTED
    #
    # This makes the endpoint idempotent.
    # If the driver presses Accept again,
    # seats are NOT added again.
    # =====================================================

    if booking.status == "ACCEPTED":

        room, created = (
            ChatRoom.objects.get_or_create(
                booking=booking,
                defaults={
                    "driver": ride.driver,
                    "passenger": booking.user,
                },
            )
        )

        print(
            "✅ BOOKING ALREADY ACCEPTED:",
            booking.status
        )

        print(
            "💬 CHAT ROOM:",
            room.id
        )

        print(
            "💬 CHAT ROOM CREATED:",
            created
        )

        return Response({
            "message":
            "Booking already accepted & chat enabled"
        })

    # =====================================================
    # SEAT CHECK
    # =====================================================

    if not ride.can_book(
        booking.seats
    ):

        return Response(
            {
                "error":
                "Seats no longer available"
            },
            status=400
        )

    # =====================================================
    # ACCEPT BOOKING
    # =====================================================

    booking.status = "ACCEPTED"

    booking.save(
        update_fields=["status"]
    )

    # =====================================================
    # RESERVE SEATS
    # =====================================================

    ride.seats_booked += booking.seats

    ride.save()

    ride.refresh_from_db()

    print(
        "SEATS AFTER ACCEPT:",
        ride.seats_booked
    )

    # =====================================================
    # CREATE CHAT ROOM
    # =====================================================

    room, created = (
        ChatRoom.objects.get_or_create(
            booking=booking,
            defaults={
                "driver": ride.driver,
                "passenger": booking.user,
            },
        )
    )

    print(
        "💬 CHAT ROOM:",
        room.id
    )

    print(
        "💬 CHAT ROOM CREATED:",
        created
    )

    return Response({
        "message":
        "Booking accepted & chat enabled"
    })


# =========================================================
# 🚗 START RIDE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ride(request, booking_id):

    booking = Booking.objects.select_related(
        "ride"
    ).get(
        id=booking_id
    )

    ride = booking.ride

    # =====================================================
    # DRIVER CHECK
    # =====================================================

    if ride.driver != request.user:

        return Response(
            {
                "error": "Not your ride"
            },
            status=403,
        )

    # =====================================================
    # PAYMENT CHECK
    # =====================================================

    is_cod = Payment.objects.filter(
        booking=booking,
        payment_type="COD",
    ).exists()

    if (
        booking.payment_status not in [
            "PAID",
            "Cash",
        ]
        and not is_cod
    ):

        return Response(
            {
                "error": (
                    "Passenger must complete payment "
                    "before ride can start"
                )
            },
            status=400,
        )

    # =====================================================
    # BOOKING STATUS CHECK
    # =====================================================

    if booking.status != "ACCEPTED":

        return Response(
            {
                "error": (
                    "Booking has not been accepted "
                    "by the driver"
                )
            },
            status=400,
        )

    # =====================================================
    # START BOOKING
    # =====================================================

    booking.status = "STARTED"

    booking.save(
        update_fields=[
            "status"
        ]
    )

    # =====================================================
    # START RIDE
    # =====================================================

    ride.status = "ACTIVE"

    ride.save(
        update_fields=[
            "status"
        ]
    )

    # =====================================================
    # NOTIFY PASSENGERS
    # =====================================================

    passenger_bookings = ride.bookings.filter(
        status="STARTED"
    ).select_related(
        "user"
    )

    for passenger_booking in passenger_bookings:

        try:

            print(
                "🔥 RIDE STARTED NOTIFICATION TRIGGER:",
                passenger_booking.id,
            )

            notification_result = (
                NotificationDispatcher.trigger(
                    "RIDE_STARTED",
                    passenger_booking,
                    source=ride.source,
                    destination=ride.destination,
                    metadata={
                        "route": (
                            f"/tracking/{ride.id}"
                        ),
                        "ride_id": ride.id,
                        "booking_id": (
                            passenger_booking.id
                        ),
                    },
                )
            )

            print(
                "🔥 RIDE STARTED NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ RIDE STARTED NOTIFICATION ERROR:",
                str(notification_error),
            )

    # =====================================================
    # RESPONSE
    # =====================================================

    return Response(
        {
            "success": True,
            "message": "Ride started 🚗",
        }
    )
# =========================================================
# 🏁 END RIDE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_ride(request, booking_id):

    booking = Booking.objects.select_related(
        "ride"
    ).get(
        id=booking_id
    )

    ride = booking.ride

    # =====================================================
    # DRIVER CHECK
    # =====================================================

    if ride.driver != request.user:

        return Response(
            {
                "error": "Not your ride"
            },
            status=403,
        )

    # =====================================================
    # RIDE STATUS CHECK
    # =====================================================

    if ride.status != "ACTIVE":

        return Response(
            {
                "error": "Ride is not active"
            },
            status=400,
        )

    # =====================================================
    # GET STARTED BOOKINGS
    # =====================================================

    started_bookings = (
        ride.bookings
        .filter(
            status="STARTED"
        )
        .select_related(
            "user"
        )
    )

    # =====================================================
    # COMPLETE RIDE
    # =====================================================

    ride.status = "COMPLETED"

    ride.save(
        update_fields=[
            "status"
        ]
    )

    # =====================================================
    # COMPLETE PASSENGER BOOKINGS
    # =====================================================

    started_bookings.update(
        status="COMPLETED"
    )

    # =====================================================
    # NOTIFY PASSENGERS
    # =====================================================

    for passenger_booking in started_bookings:

        try:

            print(
                "🔥 RIDE COMPLETED NOTIFICATION TRIGGER:",
                passenger_booking.id,
            )

            notification_result = (
                NotificationDispatcher.trigger(
                    "RIDE_COMPLETED",
                    passenger_booking,
                    source=ride.source,
                    destination=ride.destination,
                    metadata={
                        "route": (
                            f"/ride/{ride.id}"
                        ),
                        "ride_id": ride.id,
                        "booking_id": (
                            passenger_booking.id
                        ),
                    },
                )
            )

            print(
                "🔥 RIDE COMPLETED NOTIFICATION COMPLETED:",
                notification_result,
            )

        except Exception as notification_error:

            print(
                "❌ RIDE COMPLETED NOTIFICATION ERROR:",
                str(notification_error),
            )

    # =====================================================
    # RESPONSE
    # =====================================================

    return Response(
        {
            "message": "Ride completed ✅"
        }
    )