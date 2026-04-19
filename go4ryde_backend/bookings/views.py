from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from rest_framework.decorators import api_view,permission_classes

from .models import *
from .serializers import *

from coupons.models import *
from coupons.utils import *

from rides.models import Ride


class CreateBookingView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CreateBookingSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = request.user
        data = serializer.validated_data

        ride = data["ride"]
        seats = data["seats"]

        # 🔥 LOCK RIDE (IMPORTANT)
        ride = Ride.objects.select_for_update().get(id=ride.id)

        # ❌ Check again (race condition safety)
        if not ride.can_book(seats):
            return Response({"error": "Seats no longer available"}, status=400)

        # 💰 PRICE CALCULATION
        original_amount = ride.price_per_seat * seats
        final_amount = original_amount
        coupon_obj = None

        # 🔥 COUPON
        coupon_code = data.get("coupon_code")

        if coupon_code:
            try:
                coupon = Coupon.objects.get(code=coupon_code)

                is_valid, message = validate_coupon(coupon, user, original_amount)

                if not is_valid:
                    return Response({"error": message}, status=400)

                discount, final_amount = apply_coupon_discount(coupon, original_amount)
                coupon_obj = coupon

            except Coupon.DoesNotExist:
                return Response({"error": "Invalid coupon"}, status=400)

        # 🔥 BOOK SEATS
        ride.book_seat(seats)

        # ✅ CREATE BOOKING
        booking = Booking.objects.create(
            user=user,
            ride=ride,
            seats=seats,
            original_amount=original_amount,
            final_amount=final_amount,
            coupon=coupon_obj,
            status="PENDING"
        )

        return Response({
            "message": "Booking confirmed 🚀",
            "booking_id": booking.id,
            "final_amount": final_amount
        })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_bookings(request):

    bookings = Booking.objects.select_related("ride").filter(
        user=request.user
    ).order_by("-created_at")

    data = [{
        "id": b.id,

        # 🔥 IMPORTANT FIX
        "ride": str(b.ride),
        "ride_id": b.ride.id,   # ✅ REQUIRED

        "amount": b.final_amount,
        "status": b.status,
        "payment_status": b.payment_status,

        # 🔥 EXTRA (OPTIONAL BUT GOOD)
        "ride_status": b.ride.status
    } for b in bookings]

    return Response(data)

@api_view(["POST"])
def cancel_booking(request, booking_id):

    booking = Booking.objects.get(id=booking_id, user=request.user)

    if booking.status == "CONFIRMED":
        return Response({"error": "Cannot cancel after confirmation"}, status=400)

    booking.status = "CANCELLED"
    booking.save()

    return Response({"message": "Booking cancelled"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_booking(request, booking_id):

    booking = Booking.objects.get(id=booking_id)

    # 🔥 VALIDATION
    if booking.status != "PENDING":
        return Response({"error": "Booking already processed"}, status=400)

    # 🔥 ONLY DRIVER CAN ACCEPT
    if booking.ride.driver != request.user:
        return Response({"error": "Not authorized"}, status=403)

    booking.status = "ACCEPTED"
    booking.save()

    return Response({"message": "Booking accepted ✅"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_ride(request, booking_id):

    booking = Booking.objects.select_related("ride").get(id=booking_id)

    if booking.status != "ACCEPTED":
        return Response({"error": "Ride not accepted"}, status=400)

    if booking.ride.driver != request.user:
        return Response({"error": "Not driver"}, status=403)

    # ✅ UPDATE BOTH
    booking.status = "STARTED"
    booking.save()

    booking.ride.status = "ACTIVE"   # 🔥 CRITICAL
    booking.ride.save()

    return Response({"message": "Ride started 🚗"})