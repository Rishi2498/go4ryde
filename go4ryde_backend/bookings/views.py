from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from payments.models import Payment
from django.shortcuts import get_object_or_404
from urllib3 import request
from bookings.models import Booking
from bookings.serializers import *
from coupons.models import Coupon
from coupons.utils import validate_coupon, apply_coupon_discount
from rides.models import Ride
from chat.models import ChatRoom
from rest_framework.decorators import throttle_classes
from payments.throttles import BookingThrottle
from notifications.dispatcher import NotificationDispatcher

# -------------------------
# 💬 HELPER: ADD USER TO CHAT
# -------------------------
def add_user_to_chat(booking):
    room, _ = ChatRoom.objects.get_or_create(booking=booking)

    # ✅ Add both users
    room.participants.add(booking.user)          # passenger
    room.participants.add(booking.ride.driver)   # driver

    print("👥 CHAT USERS:", list(room.participants.values_list("id", flat=True)))

# -------------------------
# 🚀 CREATE BOOKING
# -------------------------

class CreateBookingView(APIView):
    
    throttle_classes = [BookingThrottle]
    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)
        print("REQUEST DATA:", request.data)
        print("USER:", request.user)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = request.user
        data = serializer.validated_data

        ride = data["ride"]
        seats = data["seats"]

        # 🔒 LOCK RIDE
        ride = Ride.objects.select_for_update().get(id=ride.id)

        # ❌ DRIVER CANNOT BOOK OWN RIDE
        if ride.driver == user:
            return Response({"error": "Driver cannot book own ride"}, status=403)
        print("RIDE:", ride.id)
        print("SEATS:", seats)
        print("CAN BOOK:", ride.can_book(seats))
        # ❌ SEAT CHECK
        if not ride.can_book(seats):
            return Response({"error": "Seats no longer available"}, status=400)

        # 💰 PRICE CALCULATION
        original_amount = ride.price_per_seat * seats
        final_amount = original_amount
        coupon_obj = None

        # 🎟 APPLY COUPON
        coupon_code = data.get("coupon_code")

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)

                is_valid, message = validate_coupon(coupon, user, original_amount)

                if not is_valid:
                    print("SERIALIZER ERRORS:", serializer.errors)
                    return Response({"error": message}, status=400)

                discount, final_amount = apply_coupon_discount(coupon, original_amount)
                coupon_obj = coupon

            except Coupon.DoesNotExist:
                return Response({"error": "Invalid coupon"}, status=400)

        # 🔥 BOOK SEATS
        # ride.book_seat(seats)

        # ✅ CREATE BOOKING
        booking = Booking.objects.create(
            user=user,
            ride=ride,
            seats=seats,
            original_amount=original_amount,
            final_amount=final_amount,
            coupon=coupon_obj,
            status="PENDING",
            payment_status="PENDING"
        )
        
        NotificationDispatcher.trigger(
    "BOOKING_CREATED",
    booking,
    passenger_name=(
    booking.user.username
    or booking.user.email
),
    seats=booking.seats,
    source=booking.ride.source,
    destination=booking.ride.destination,
    metadata={
        "route": f"/ride/{booking.ride.id}"
    }
    
)
        return Response({
            "message": "Booking created 🚀",
            "booking_id": booking.id,
            "final_amount": final_amount
        })


# -------------------------
# 📦 USER BOOKINGS
# -------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookings(request):

    bookings = Booking.objects.select_related(
        "ride",
        "ride__driver"
    ).filter(
        user=request.user
    ).order_by("-created_at")

    data = [{
        "id": b.id,
        "ride": str(b.ride),
        "ride_id": b.ride.id,
        "amount": b.final_amount,
        "status": b.status,
        "payment_status": b.payment_status,
        "payment_type": (
    Payment.objects
    .filter(booking=b)
    .order_by("-id")
    .values_list("payment_type", flat=True)
    .first()
),  
        "ride_status": b.ride.status,
        "driver_name": b.ride.driver.email.split("@")[0],
        "driver_phone": b.ride.driver.phone,
    } for b in bookings]

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def booking_detail(request, id):
   
    booking = get_object_or_404(
        Booking.objects.select_related(
            "ride",
            "ride__driver"
        ),
        id=id,
    )
    if (
        booking.user != request.user
        and
        booking.ride.driver != request.user
    ):
        return Response(
            {"error": "Unauthorized"},
            status=403
        )

    data = {
        "id": booking.id,
        "ride": str(booking.ride),
        "ride_id": booking.ride.id,
        "amount": booking.final_amount,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "ride_status": booking.ride.status,
        "driver_name": booking.ride.driver.email.split("@")[0],
        "driver_phone": booking.ride.driver.phone,
    }

    return Response(data)

# -------------------------
# ❌ CANCEL BOOKING
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def cancel_booking(request, booking_id):

    booking = get_object_or_404(
        Booking.objects.select_related("ride"),
        id=booking_id,
        user=request.user
    )

    if booking.status == "CANCELLED":
        return Response({"error": "Already cancelled"}, status=400)

    if booking.status == "STARTED":
        return Response({"error": "Cannot cancel after ride started"}, status=400)

    ride = booking.ride

    # 🔥 RELEASE SEATS ONLY IF LOCKED
    if booking.status == "CONFIRMED":
        ride.seats_booked = max(0, ride.seats_booked - booking.seats)
        ride.save()

    # 🔥 HANDLE PAYMENT STATES
    if booking.payment_status == "PAID":
        booking.payment_status = "REFUND_PENDING"

    elif booking.payment_status == "PARTIALLY_PAID":
        booking.payment_status = "PARTIAL_REFUND_PENDING"

    booking.status = "CANCELLED"
    booking.save()
    NotificationDispatcher.trigger(
    "BOOKING_REJECTED",
    booking,
    source=booking.ride.source,
    destination=booking.ride.destination,
    metadata={
    "route": f"/booking/{booking.id}"
    }
)
    return Response({"message": "Booking cancelled"})

# -------------------------
# ✅ DRIVER ACCEPT BOOKING
# -------------------------

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def accept_booking(request, booking_id):

    booking = get_object_or_404(
        Booking.objects.select_related("ride"),
        id=booking_id
    )

    ride = Ride.objects.select_for_update().get(
        id=booking.ride.id
    )

    # ❌ NOT DRIVER
    if ride.driver != request.user:
        return Response(
            {"error": "Not authorized"},
            status=403
        )

    # ❌ ALREADY PROCESSED
    if booking.status != "PENDING":

        print("❌ Already processed")
        print("Current Status:", booking.status)

        return Response(
            {"error": "Already processed"},
            status=400
        )

    # ❌ REQUIRE PAYMENT
    if booking.payment_status not in [
        "PAID",
        "PARTIALLY_PAID",
        "Cash"
    ]:

        print(
            "❌ Payment not initiated:",
            booking.payment_status
        )

        return Response(
            {"error": "Payment not initiated"},
            status=400
        )

    # ❌ SEAT CHECK
    if not ride.can_book(booking.seats):

        print("❌ Seats no longer available")

        return Response(
            {"error": "Seats no longer available"},
            status=400
        )

    # 🔥 LOCK SEATS
    ride.seats_booked += booking.seats
    ride.save()

    # ✅ CONFIRM BOOKING
    booking.status = "CONFIRMED"
    booking.save()

    # ✅ CREATE CHAT ROOM
    room, _ = ChatRoom.objects.get_or_create(
        booking=booking,
        defaults={
            "driver": booking.ride.driver,
            "passenger": booking.user,
        }
    )

    # ✅ NOTIFICATION
    NotificationDispatcher.trigger(
        "BOOKING_ACCEPTED",
        booking,
        source=booking.ride.source,
        destination=booking.ride.destination,
        metadata={
            "route": f"/booking/{booking.id}"
        }
    )

    print(
        f"🔥 FINAL USERS: Driver: {room.driver.email}, Passenger: {room.passenger.email}"
    )

    return Response({
        "success": True,
        "message": "Booking accepted"
    })

# -------------------------
# 🚗 START RIDE
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ride(request, booking_id):

    booking = get_object_or_404(
        Booking.objects.select_related("ride"),
        id=booking_id
    )

    ride = booking.ride

    if ride.driver != request.user:
        return Response({"error": "Not driver"}, status=403)

    # ❌ MUST BE FULLY PAID
    if booking.payment_status not in [
    "PAID",
    "Cash"
]:
        return Response({"error": "Full payment required"}, status=400)

    if booking.status != "CONFIRMED":
        return Response({"error": "Booking not confirmed"}, status=400)

    booking.status = "STARTED"
    booking.save()

    ride.status = "ACTIVE"
    ride.save()
    NotificationDispatcher.trigger(
    "RIDE_STARTED",
    booking,
    source=booking.ride.source,
    destination=booking.ride.destination,
    metadata={
        "route": f"/tracking/{ride.id}"
    }
)
    return Response({"message": "Ride started 🚗"})



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_ride(request, booking_id):

    booking = get_object_or_404(
        Booking.objects.select_related("ride"),
        id=booking_id
    )

    ride = booking.ride

    # ❌ ONLY DRIVER CAN END
    if ride.driver != request.user:
        return Response(
            {"error": "Not driver"},
            status=403
        )

    # ❌ MUST BE STARTED
    if booking.status != "STARTED":
        return Response(
            {"error": "Ride not started"},
            status=400
        )

    # ✅ COMPLETE BOOKING
    booking.status = "COMPLETED"
    booking.save()

    # =====================================
    # ✅ CHECK IF ALL BOOKINGS COMPLETED
    # =====================================
    active_bookings = Booking.objects.filter(
        ride=ride,
        status__in=[
            "CONFIRMED",
            "STARTED"
        ]
    ).exists()

    # ✅ END ENTIRE RIDE
    if not active_bookings:

        ride.status = "COMPLETED"

        ride.save()

    # =====================================
    # ✅ DISABLE CHAT
    # =====================================
    try:

        room = ChatRoom.objects.get(
            booking=booking
        )

        room.is_active = False

        room.save()

        NotificationDispatcher.trigger(
    "RIDE_COMPLETED",
    booking,
    source=booking.ride.source,
    destination=booking.ride.destination,
    metadata={
        "route": f"/booking/{booking.id}"
    }
)

    except ChatRoom.DoesNotExist:
        pass

    return Response({

        "message": "Ride completed ✅",

        "ride_status": ride.status,

        "booking_status": booking.status

    })