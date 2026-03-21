from django import forms
from django.utils import timezone

from .models import Booking
from rides.models import Ride


PAYMENT_METHOD_CHOICES = [
    ('razorpay', 'Razorpay (Online)'),
    ('cash', 'Cash'),
]


class BookingForm(forms.Form):
    ride = forms.ModelChoiceField(queryset=Ride.objects.filter(is_active=True))
    seats = forms.IntegerField(min_value=1)
    payment_method = forms.ChoiceField(choices=PAYMENT_METHOD_CHOICES)

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    def clean_ride(self):
        ride = self.cleaned_data['ride']
        if not ride.is_active:
            raise forms.ValidationError("This ride is no longer active.")
        if ride.departure_time <= timezone.now():
            raise forms.ValidationError("Cannot book a ride that has already started.")
        return ride

    def clean(self):
        cleaned = super().clean()
        ride = cleaned.get('ride')
        seats = cleaned.get('seats')

        if ride and seats:
            # Seats availability
            if seats > ride.available_seats:
                self.add_error(
                    'seats',
                    f"Only {ride.available_seats} seat(s) available.",
                )

            # Duplicate booking check
            if self.user and Booking.objects.filter(
                ride=ride,
                passenger=self.user,
                status__in=['pending', 'confirmed'],
            ).exists():
                raise forms.ValidationError("You already have an active booking for this ride.")

        return cleaned


# ──────────────────────────────────────────────
# Payment Form
# ──────────────────────────────────────────────

class PaymentForm(forms.Form):
    booking_id = forms.IntegerField()
    payment_method = forms.ChoiceField(choices=PAYMENT_METHOD_CHOICES)

    def __init__(self, *args, user=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user

    def clean_booking_id(self):
        booking_id = self.cleaned_data['booking_id']
        try:
            booking = Booking.objects.get(id=booking_id)
        except Booking.DoesNotExist:
            raise forms.ValidationError("Booking not found.")

        if self.user and booking.passenger != self.user:
            raise forms.ValidationError("This booking does not belong to you.")

        if booking.status != 'pending':
            raise forms.ValidationError("Booking is not in a payable state.")

        self._booking = booking
        return booking_id
