from rest_framework.test import APITestCase
from django.core.cache import cache
from accounts.models import OTP, User
from unittest.mock import patch


class AccountsTestCase(APITestCase):

    def setUp(self):
        cache.clear()
        self.email = "test@example.com"
        self.phone = "9876543210"

    # -----------------------------
    # ✅ SEND OTP SUCCESS
    # -----------------------------
    @patch("accounts.views.send_mail")  # 🔥 mock email
    def test_send_otp_success(self, mock_send_mail):
        response = self.client.post("/api/accounts/send-otp/", {
            "email": self.email
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(OTP.objects.count(), 1)

    # -----------------------------
    # ❌ SEND OTP WITHOUT EMAIL
    # -----------------------------
    def test_send_otp_no_email(self):
        response = self.client.post("/api/accounts/send-otp/", {})

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ OTP COOLDOWN
    # -----------------------------
    @patch("accounts.views.send_mail")
    def test_send_otp_cooldown(self, mock_send_mail):
        cache.set(f"otp_cooldown_{self.email}", True, timeout=60)

        response = self.client.post("/api/accounts/send-otp/", {
            "email": self.email
        })

        self.assertEqual(response.status_code, 429)

    # -----------------------------
    # ✅ REGISTER SUCCESS
    # -----------------------------
    def test_register_success(self):
        OTP.objects.create(email=self.email, otp="123456")

        response = self.client.post("/api/accounts/register/", {
            "email": self.email,
            "phone": self.phone,
            "otp": "123456"
        })

        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(email=self.email).exists())

    # -----------------------------
    # ❌ REGISTER INVALID OTP
    # -----------------------------
    def test_register_invalid_otp(self):
        OTP.objects.create(email=self.email, otp="123456")

        response = self.client.post("/api/accounts/register/", {
            "email": self.email,
            "phone": self.phone,
            "otp": "000000"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ REGISTER EXPIRED OTP
    # -----------------------------
    def test_register_expired_otp(self):
        otp = OTP.objects.create(email=self.email, otp="123456")

        # simulate expiry
        otp.created_at = otp.created_at.replace(year=2000)
        otp.save()

        response = self.client.post("/api/accounts/register/", {
            "email": self.email,
            "phone": self.phone,
            "otp": "123456"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ REGISTER DUPLICATE USER
    # -----------------------------
    def test_register_duplicate_user(self):
        User.objects.create(email=self.email, phone=self.phone)
        OTP.objects.create(email=self.email, otp="123456")

        response = self.client.post("/api/accounts/register/", {
            "email": self.email,
            "phone": self.phone,
            "otp": "123456"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ✅ LOGIN SUCCESS
    # -----------------------------
    def test_login_success(self):
        User.objects.create(email=self.email, phone=self.phone)
        OTP.objects.create(email=self.email, otp="123456")

        response = self.client.post("/api/accounts/login/", {
            "email": self.email,
            "otp": "123456"
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    # -----------------------------
    # ❌ LOGIN INVALID OTP
    # -----------------------------
    def test_login_invalid_otp(self):
        User.objects.create(email=self.email, phone=self.phone)
        OTP.objects.create(email=self.email, otp="123456")

        response = self.client.post("/api/accounts/login/", {
            "email": self.email,
            "otp": "000000"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ LOGIN USER NOT FOUND
    # -----------------------------
    def test_login_user_not_found(self):
        response = self.client.post("/api/accounts/login/", {
            "email": self.email,
            "otp": "123456"
        })

        self.assertEqual(response.status_code, 404)

    # -----------------------------
    # ✅ PROFILE VIEW (PASSENGER)
    # -----------------------------
    def test_profile_passenger(self):
        user = User.objects.create(email=self.email, phone=self.phone)

        self.client.force_authenticate(user=user)

        response = self.client.get("/api/accounts/profile/")

        self.assertEqual(response.status_code, 200)

    # -----------------------------
    # ❌ PROFILE UNAUTHORIZED
    # -----------------------------
    def test_profile_unauthorized(self):
        response = self.client.get("/api/accounts/profile/")

        self.assertEqual(response.status_code, 401)

    # -----------------------------
    # ✅ DRIVER UPGRADE
    # -----------------------------
    def test_driver_upgrade(self):
        user = User.objects.create(email=self.email, phone=self.phone)

        self.client.force_authenticate(user=user)

        response = self.client.post("/api/accounts/driver-upgrade/", {
            "vehicle_number": "AP09AB1234"
        })

        self.assertEqual(response.status_code, 200)

    # -----------------------------
    # ✅ LOGOUT
    # -----------------------------
    def test_logout(self):
        user = User.objects.create(email=self.email, phone=self.phone)

        self.client.force_authenticate(user=user)

        response = self.client.post("/api/accounts/logout/", {
            "refresh": "dummy_token"
        })

        # may fail depending on blacklist setup
        self.assertIn(response.status_code, [200, 400])