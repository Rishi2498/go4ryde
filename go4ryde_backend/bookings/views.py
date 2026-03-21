from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import Booking, BookingCancellation
from .serializers import BookingSerializer, BookingCancellationSerializer
from rides.models import Ride


class CreateBookingView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        ride_id = self.request.data.get('ride_id')
        ride = Ride.objects.get(id=ride_id)
        seats = int(self.request.data.get('seats', 1))
        total_price = ride.price_per_seat * seats

        with transaction.atomic():
            serializer.save(
                passenger=self.request.user,
                ride=ride,
                total_price=total_price,
                status='pending'
            )
            ride.available_seats -= seats
            ride.save()

        serializer = self.get_serializer(booking)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(passenger=self.request.user)


class UserBookingsView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(passenger=self.request.user).order_by('-created_at')


class CancelBookingView(APIView):
    """Cancel a booking with penalty logic."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(id=pk, passenger=request.user)
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)

        if booking.status == 'cancelled':
            return Response({"error": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status == 'completed':
            return Response({"error": "Cannot cancel a completed booking."}, status=status.HTTP_400_BAD_REQUEST)

        # Penalty: if cancelling within 2 hours of departure, 20% penalty
        penalty = Decimal('0.00')
        ride = booking.ride
        time_until_departure = ride.departure_time - timezone.now()

        if time_until_departure < timedelta(hours=2):
            penalty = booking.total_price * Decimal('0.20')

        reason = request.data.get('reason', '')

        with transaction.atomic():
            booking.status = 'cancelled'
            booking.save()

            BookingCancellation.objects.create(
                booking=booking,
                reason=reason,
                penalty_applied=penalty,
            )

            # Restore seats
            ride.available_seats += booking.seats
            ride.save()

        return Response({
            "message": "Booking cancelled successfully.",
            "penalty_applied": str(penalty),
            "refund_amount": str(booking.total_price - penalty),
        }, status=status.HTTP_200_OK)
