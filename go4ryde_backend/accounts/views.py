from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *
from django.core.mail import send_mail
from django.conf import settings
import random
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated

# ---------------- SEND OTP ----------------
class SendOTPView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = []            # ✅ VERY IMPORTANT (disable JWT here)

    def post(self, request):
        email = request.data.get('email')

        otp_code = str(random.randint(100000, 999999))

        OTP.objects.create(email=email, otp=otp_code)

        send_mail(
            "Your OTP Code",
            f"Your OTP is {otp_code}",
            settings.EMAIL_HOST_USER,
            [email],
        )

        return Response({"message": "OTP sent"})


# ---------------- VERIFY + REGISTER ----------------
class RegisterView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = []            # ✅ VERY IMPORTANT (disable JWT here)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        phone = serializer.validated_data['phone']
        otp_input = serializer.validated_data['otp']

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj:
            return Response({"error": "OTP not found"}, status=400)

        if otp_obj.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        if otp_obj.attempts >= 3:
            return Response({"error": "Max attempts reached"}, status=400)

        if otp_obj.otp != otp_input:
            otp_obj.attempts += 1
            otp_obj.save()
            return Response({"error": "Invalid OTP"}, status=400)

        user = User.objects.create(email=email, phone=phone)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role
        })


# ---------------- LOGIN ----------------
class LoginView(APIView):
    permission_classes = [AllowAny] 
    authentication_classes = []            # ✅ VERY IMPORTANT (disable JWT here)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_input = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
        except:
            return Response({"error": "User not found"}, status=404)

        otp_obj = OTP.objects.filter(email=email).last()

        if otp_obj.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        if otp_obj.otp != otp_input:
            return Response({"error": "Invalid OTP"}, status=400)

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role
        })


# ---------------- DRIVER UPGRADE ----------------

# ---------------- PROFILE VIEW ----------------
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # DRIVER
        if user.role == 'DRIVER':
            try:
                driver = DriverProfile.objects.get(user=user)
                serializer = DriverProfileViewSerializer(driver)
                return Response(serializer.data)
            except DriverProfile.DoesNotExist:
                return Response({"error": "Driver profile not found"}, status=404)

        # PASSENGER
        serializer = PassengerProfileSerializer(user)
        return Response(serializer.data)


# ---------------- DRIVER UPGRADE ----------------
class DriverUpgradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        driver_profile, created = DriverProfile.objects.get_or_create(user=user)

        serializer = DriverProfileViewSerializer(
            driver_profile,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        serializer.save(user=user)

        user.role = 'DRIVER'
        user.save()

        return Response({
            "message": "Driver profile updated" if not created else "Upgraded to driver"
        }, status=status.HTTP_200_OK)

# ---------------- LOGOUT ----------------
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Logged out"})
        except Exception:
            return Response({"error": "Invalid token"}, status=400)