from django import forms
from django.utils import timezone

from .models import Ride


class CreateRideForm(forms.ModelForm):
    class Meta:
        model = Ride
        fields = [
            'ride_type', 'source_name', 'destination_name',
            'source_lat', 'source_lng', 'dest_lat', 'dest_lng',
            'stops', 'route_polyline',
            'departure_time', 'available_seats', 'total_seats',
            'women_only', 'price_per_seat',
        ]
        widgets = {
            'departure_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'stops': forms.Textarea(attrs={'rows': 3, 'placeholder': '[{"name":"...","lat":...,"lng":...}]'}),
        }

    def __init__(self, *args, driver_profile=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.driver_profile = driver_profile

    # ── field-level validations ──

    def clean_departure_time(self):
        dt = self.cleaned_data.get('departure_time')
        if dt and dt <= timezone.now():
            raise forms.ValidationError("Departure time must be in the future.")
        return dt

    def clean_available_seats(self):
        seats = self.cleaned_data.get('available_seats')
        if seats is not None and seats <= 0:
            raise forms.ValidationError("Available seats must be greater than 0.")
        return seats

    def clean_total_seats(self):
        seats = self.cleaned_data.get('total_seats')
        if seats is not None and seats <= 0:
            raise forms.ValidationError("Total seats must be greater than 0.")
        return seats

    # ── cross-field validation ──

    def clean(self):
        cleaned = super().clean()
        available = cleaned.get('available_seats')
        total = cleaned.get('total_seats')

        # Available cannot exceed total
        if available and total and available > total:
            self.add_error('available_seats', "Available seats cannot exceed total seats.")

        # Seats cannot exceed vehicle capacity
        if self.driver_profile and total:
            if total > self.driver_profile.capacity:
                self.add_error(
                    'total_seats',
                    f"Total seats cannot exceed vehicle capacity ({self.driver_profile.capacity}).",
                )

        # Driver must be approved
        if self.driver_profile and self.driver_profile.status != 'approved':
            raise forms.ValidationError("Your driver profile must be approved before creating rides.")

        return cleaned

    def save(self, commit=True):
        ride = super().save(commit=False)
        if self.driver_profile:
            ride.driver = self.driver_profile
        if commit:
            ride.save()
        return ride


class SearchRideForm(forms.Form):
    source_lat = forms.FloatField(required=True)
    source_lng = forms.FloatField(required=True)
    dest_lat = forms.FloatField(required=True)
    dest_lng = forms.FloatField(required=True)
    date_time = forms.DateTimeField(required=True)
    ride_type = forms.ChoiceField(
        choices=[('', 'All'), ('local', 'Local'), ('intercity', 'Intercity')],
        required=False,
    )
    vehicle_type = forms.ChoiceField(
        choices=[('', 'All'), ('car', 'Car'), ('bike', 'Bike')],
        required=False,
    )
    women_only = forms.BooleanField(required=False)
