from rest_framework import serializers
from .models import Booking, BookingCancellation
from rides.serializers import RideSerializer
from accounts.serializers import UserSerializer
from .forms import BookingForm


class BookingSerializer(serializers.ModelSerializer):
    passenger = UserSerializer(read_only=True)
    ride_details = RideSerializer(source='ride', read_only=True)
    ride_id = serializers.IntegerField(write_only=True)
    payment_method = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Booking
        fields = ['id', 'ride_id', 'ride_details', 'passenger', 'seats', 'total_price', 'status', 'created_at', 'payment_method']
        read_only_fields = ['id', 'passenger', 'total_price', 'status', 'created_at']

    def validate(self, data):
        # Use BookingForm for validation
        user = self.context['request'].user
        form_data = {
            'ride': data.get('ride_id'),
            'seats': data.get('seats'),
            'payment_method': data.get('payment_method', 'razorpay'),
        }
        form = BookingForm(data=form_data, user=user)
        if not form.is_valid():
            raise serializers.ValidationError(form.errors)
        return data


class BookingCancellationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingCancellation
        fields = ['id', 'booking', 'reason', 'penalty_applied', 'cancelled_at']
        read_only_fields = ['id', 'penalty_applied', 'cancelled_at']
