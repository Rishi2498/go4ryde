from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.models import *
from accounts.serializers import *
from django.core.mail import send_mail
from django.conf import settings
import random
# from .models import OTP
# from .throttles import SendOTPThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import throttle_classes
from accounts.throttles import *
from django.core.cache import cache
from payments.models import Wallet
from django.db import transaction
from django.contrib.auth import get_user_model

User = get_user_model()
# ---------------- SEND OTP ----------------

class SendOTPView(APIView):

    permission_classes = [AllowAny]

    authentication_classes = []

    throttle_classes = [SendOTPThrottle]

    def post(self, request):

        email = request.data.get("email")

        mode = request.data.get("mode")

        # =====================================
        # ❌ EMAIL REQUIRED
        # =====================================
        if not email:

            return Response(
                {
                    "error": "Email required"
                },
                status=400
            )

        # =====================================
        # ❌ MODE REQUIRED
        # =====================================
        if not mode:

            return Response(
                {
                    "error": "Mode required"
                },
                status=400
            )

        # =====================================
        # ✅ CHECK USER EXISTS
        # =====================================
        user_exists = User.objects.filter(
            email=email
        ).exists()

        # =====================================
        # 🔐 LOGIN FLOW
        # =====================================
        if mode == "login" and not user_exists:

            return Response(
                {
                    "error": "User not found",

                    "redirect": "register"
                },
                status=404
            )

        # =====================================
        # 🚫 REGISTER FLOW
        # =====================================
        if mode == "register" and user_exists:

            return Response(
                {
                    "error": "User already exists",

                    "redirect": "login"

                },
                status=400
            )

        # =====================================
        # 🔥 OTP COOLDOWN
        # =====================================
        cache_key = f"otp_cooldown_{email}"

        if cache.get(cache_key):

            return Response(
                {
                    "error":
                        "Wait before requesting OTP again"
                },
                status=429
            )

        # =====================================
        # 🔐 GENERATE OTP
        # =====================================
        otp_code = str(
            random.randint(100000, 999999)
        )

        # =====================================
        # 💾 SAVE OTP
        # =====================================
        OTP.objects.create(

            email=email,

            otp=otp_code
        )

        # =====================================
        # ⏳ 60 SEC COOLDOWN
        # =====================================
        cache.set(

            cache_key,

            True,

            timeout=10
        )

        # =====================================
        # 📩 SEND EMAIL
        # =====================================
        send_mail(

            "Your OTP Code",

            f"Your OTP is {otp_code}",

            settings.EMAIL_HOST_USER,

            [email],
        )

        # =====================================
        # ✅ SUCCESS
        # =====================================
        return Response({

            "message": "OTP sent successfully",

            "mode": mode

        })
# ---------------- VERIFY + REGISTER ----------------
class RegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [VerifyOTPThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        email = serializer.validated_data['email']
        phone = serializer.validated_data['phone']
        otp_input = serializer.validated_data['otp']

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj:
            return Response({"error": "OTP not found"}, status=400)

        if otp_obj.is_expired():
            return Response({"error": "OTP expired"}, status=400)

        if otp_obj.attempts >= 3:
            return Response({"error": "Max attempts reached"}, status=429)

        if otp_obj.otp != otp_input:
            otp_obj.attempts += 1
            otp_obj.save()
            return Response({"error": "Invalid OTP"}, status=400)

        # 🔥 PREVENT DUPLICATE USER
        if User.objects.filter(email=email).exists():
            return Response({"error": "User already exists"}, status=400)

        user = User.objects.create(
    username=username,
    email=email,
    phone=phone,
)

        Profile.objects.get_or_create(user=user)
        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": user.role
        })

# ---------------- LOGIN ----------------
class LoginView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [LoginThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_input = serializer.validated_data['otp']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        otp_obj = OTP.objects.filter(email=email).last()

        if not otp_obj or otp_obj.is_expired():
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
    throttle_classes = [ProfileThrottle]

    def get(self, request):
        user = request.user

        # DRIVER
        if user.role == 'DRIVER':
            try:
                driver = DriverProfile.objects.get(user=user)
                serializer = DriverProfileViewSerializer(driver)

                # 🔥 attach basic user info also
                data = serializer.data
                data.update({
                    "email": user.email,
                    "phone": user.phone,
                    "role": user.role,
                })

                return Response(data)

            except DriverProfile.DoesNotExist:
                return Response({"error": "Driver profile not found"}, status=404)

        # PASSENGER
        serializer = PassengerProfileSerializer(user)
        return Response(serializer.data)


# ---------------- DRIVER UPGRADE ----------------
class DriverUpgradeView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_classes = [DriverUpgradeThrottle]

    @transaction.atomic
    def post(self, request):
        user = request.user

        # ✅ Ensure driver profile exists
        driver_profile, created = DriverProfile.objects.get_or_create(user=user)

        serializer = DriverProfileViewSerializer(
            driver_profile,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)

        # ⚠️ Don't pass user here again (already linked)
        serializer.save()

        # ✅ Update role
        user.role = 'DRIVER'
        user.save()

        # 🔥 Ensure wallet exists (IMPORTANT)
        Wallet.objects.get_or_create(user=user)

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


        # ---------------- UPDATE PROFILE ----------------

class ProfileUpdateView(APIView):

    permission_classes = [IsAuthenticated]

    throttle_classes = [ProfileThrottle]

    def patch(self, request):

        user = request.user

        serializer = ProfileUpdateSerializer(
            user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        # Return the updated profile
        if user.role == 'DRIVER':

            try:

                driver = DriverProfile.objects.get(
                    user=user
                )

                profile_serializer = DriverProfileViewSerializer(
                    driver
                )

                data = profile_serializer.data

                data.update({
                    "email": user.email,
                    "phone": user.phone,
                    "username": user.username,
                    "role": user.role,
                })

                return Response(data)

            except DriverProfile.DoesNotExist:

                pass

        serializer = PassengerProfileSerializer(
            user
        )

        data = serializer.data

        data["username"] = user.username

        return Response(data)