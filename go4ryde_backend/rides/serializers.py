from rest_framework import serializers
from .models import Ride, Review
from accounts.serializers import DriverProfileSerializer
from .forms import CreateRideForm


class RideSerializer(serializers.ModelSerializer):
    driver = DriverProfileSerializer(read_only=True)

    class Meta:
        model = Ride
        fields = [
            'id', 'driver', 'ride_type', 'source_name', 'destination_name',
            'source_lat', 'source_lng', 'dest_lat', 'dest_lng',
            'stops', 'route_polyline',
            'departure_time', 'available_seats', 'total_seats',
            'women_only', 'price_per_seat', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'driver', 'is_active', 'created_at', 'updated_at']

    def validate(self, data):
        # Use CreateRideForm for complex validation
        # We need to pass the driver_profile context
        request = self.context.get('request')
        driver_profile = None
        if request and hasattr(request.user, 'driver_profile'):
            driver_profile = request.user.driver_profile

        # Create a form instance with the data
        # Note: ModelForm needs 'driver' but it's not in 'data' yet (it's in perform_create)
        # So we pass it as driver_profile to the form's __init__
        form = CreateRideForm(data=data, driver_profile=driver_profile)
        if not form.is_valid():
            raise serializers.ValidationError(form.errors)
        return data


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(source='reviewer.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'ride', 'reviewer_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'reviewer_name', 'created_at']
