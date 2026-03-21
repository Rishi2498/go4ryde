from rest_framework import serializers
from .models import User, DriverProfile
from .forms import SendOTPForm, VerifyOTPForm, DriverRegistrationForm

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'phone_number', 'name', 'role', 'is_active']

class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    name = serializers.CharField(write_only=True, required=False)
    email = serializers.EmailField(write_only=True, required=False)
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = DriverProfile
        fields = '__all__'

    def validate(self, data):
        # We use the form to validate the driver registration data
        # Note: In a real scenario, we might only pass partial data if it's an update
        # But for creation, we need all.
        if self.context['request'].method == 'POST':
            # Check for name/email/phone if new user
            pass
        return data

    def create(self, validated_data):
        # The form has a save() method that handles User + DriverProfile
        # But here we are already authenticated in the view
        return super().create(validated_data)

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(max_length=15, required=False)
    name = serializers.CharField(max_length=255, required=False)

    def validate(self, data):
        form = SendOTPForm(data={'email': data.get('email')})
        if not form.is_valid():
            raise serializers.ValidationError(form.errors)
        return data

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, min_length=6, required=True)

    def validate(self, data):
        form = VerifyOTPForm(data=data)
        if not form.is_valid():
            raise serializers.ValidationError(form.errors)
        return data
