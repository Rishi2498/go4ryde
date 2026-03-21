import random
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTPVerification, DriverProfile
from .serializers import (
    SendOTPSerializer, VerifyOTPSerializer, UserSerializer,
    DriverProfileSerializer,
)


def generate_otp():
    return str(random.randint(100000, 999999))


class SendOTPView(APIView):
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            phone_number = serializer.validated_data.get('phone_number')
            name = serializer.validated_data.get('name')

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                if not phone_number or not name:
                    return Response(
                        {'error': 'Phone number and Name are required for registration.'},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                user = User.objects.create_user(email=email, phone_number=phone_number, name=name)

            otp = generate_otp()
            OTPVerification.objects.filter(user=user).delete()
            OTPVerification.objects.create(user=user, otp=otp)

            # Mocking email/SMS sending
            print(f"OTP for {email}: {otp}")

            return Response({'message': 'OTP sent successfully'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp_input = serializer.validated_data['otp']

            try:
                user = User.objects.get(email=email)
                otp_record = OTPVerification.objects.filter(user=user).latest('created_at')
            except (User.DoesNotExist, OTPVerification.DoesNotExist):
                return Response({'error': 'Invalid request or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)

            if not otp_record.is_valid():
                return Response({'error': 'OTP expired or max attempts reached'}, status=status.HTTP_400_BAD_REQUEST)

            if otp_record.otp == otp_input:
                otp_record.delete()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': UserSerializer(user).data,
                }, status=status.HTTP_200_OK)
            else:
                otp_record.attempts += 1
                otp_record.save()
                return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get or update current user profile."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class DriverProfileCreateView(generics.CreateAPIView):
    """Register as a driver (upload DL, RC, vehicle info)."""
    serializer_class = DriverProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, 'driver_profile'):
            from rest_framework import serializers as ser
            raise ser.ValidationError("Driver profile already exists.")
        user.role = 'driver'
        user.save()
        serializer.save(user=user)


class DriverProfileDetailView(generics.RetrieveUpdateAPIView):
    """View/update own driver profile."""
    serializer_class = DriverProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user.driver_profile
