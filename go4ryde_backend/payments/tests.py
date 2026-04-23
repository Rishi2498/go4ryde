from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch
from django.urls import reverse

from accounts.models import User
from rides.models import Ride
from bookings.models import Booking
from payments.models import Payment
from django.utils.timezone import now
from datetime import timedelta
from core.models import PlatformFee


class PaymentTest(APITestCase):

    def setUp(self):
        PlatformFee.objects.get_or_create(percentage=10)

        self.user = User.objects.create(
            email="test@test.com",
            phone="123",
            role="PASSENGER"
        )

        self.token = str(RefreshToken.for_user(self.user).access_token)

        self.ride = Ride.objects.create(
            driver=self.user,
            source="A",
            destination="B",
            source_lat=1,
            source_lng=1,
            destination_lat=2,
            destination_lng=2,
            seats_available=3,
            price_per_seat=100,
            status="ACTIVE",
            date_time=now() + timedelta(hours=1)
        )

        self.booking = Booking.objects.create(
            ride=self.ride,
            user=self.user,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="PENDING",
            payment_status="PENDING"
        )

    @patch("payments.views.razorpay.Client")
    def test_create_payment(self, mock_razorpay):

        # ✅ MOCK ORDER CREATION
        mock_razorpay.return_value.order.create.return_value = {
            "id": "order_123"
        }

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        # ✅ USE reverse() (IMPORTANT)
        url = reverse("payments:create_payment")  # make sure you named it in urls.py

        # ✅ FIX PAYLOAD
        res = self.client.post(url, {
            "booking_id": self.booking.id,
            "amount": self.booking.final_amount
        }, format="json")

        print("CREATE PAYMENT RESPONSE:", getattr(res, "data", res.content))  # debug

        self.assertEqual(res.status_code, 200)
        self.assertEqual(Payment.objects.count(), 1)

    @patch("payments.views.razorpay.Client")
    def test_verify_payment_success(self, mock_razorpay):

        # ✅ MOCK SIGNATURE VERIFY
        mock_razorpay.return_value.utility.verify_payment_signature.return_value = True

        payment = Payment.objects.create(
            booking=self.booking,
            razorpay_order_id="order_123",
            amount=100,
            status="CREATED"
        )

        url = reverse("payments:verify_payment")  # ensure named

        res = self.client.post(url, {
            "order_id": "order_123",
            "payment_id": "pay_123",
            "signature": "sig_123"
        }, format="json")

        print("VERIFY RESPONSE:", getattr(res, "data", res.content))  # debug

        payment.refresh_from_db()
        self.booking.refresh_from_db()

        self.assertEqual(payment.status, "SUCCESS")
        self.assertEqual(self.booking.payment_status, "PAID")