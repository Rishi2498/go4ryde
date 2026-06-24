from rest_framework.test import APITestCase
from unittest.mock import patch

from core.factories import UserFactory, RideFactory
from bookings.models import Booking
from payments.models import Payment


class PaymentTestCase(APITestCase):

    def setUp(self):
        self.user = UserFactory()
        self.driver = UserFactory(role="DRIVER")

        self.ride = RideFactory(driver=self.driver)

        self.booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PENDING"
        )

        self.client.force_authenticate(user=self.user)

    # -----------------------------
    # ✅ CREATE PAYMENT SUCCESS
    # -----------------------------
    @patch("payments.views.calculate_amount")
    @patch("payments.views.razorpay.Client")
    def test_create_payment_success(self, mock_razorpay, mock_calc):
        # ✅ mock amount calculation
        mock_calc.return_value = (100, True)
        mock_client = mock_razorpay.return_value
        mock_client.order.create.return_value = {
            "id": "order_test_123"
        }

        response = self.client.post("/api/payments/create/", {
            "booking_id": self.booking.id,
            "payment_type": "FULL"
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Payment.objects.count(), 1)

    # -----------------------------
    # ❌ MISSING DATA
    # -----------------------------
    def test_create_payment_missing_data(self):
        response = self.client.post("/api/payments/create/", {})

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ INVALID PAYMENT TYPE
    # -----------------------------
    def test_invalid_payment_type(self):
        response = self.client.post("/api/payments/create/", {
            "booking_id": self.booking.id,
            "payment_type": "INVALID"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ BOOKING NOT FOUND
    # -----------------------------
    def test_booking_not_found(self):
        response = self.client.post("/api/payments/create/", {
            "booking_id": 999,
            "payment_type": "FULL"
        })

        self.assertEqual(response.status_code, 404)

    # -----------------------------
    # ❌ NOT YOUR BOOKING
    # -----------------------------
    def test_not_your_booking(self):
        other_user = UserFactory()

        self.client.force_authenticate(user=other_user)

        response = self.client.post("/api/payments/create/", {
            "booking_id": self.booking.id,
            "payment_type": "FULL"
        })

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ❌ ALREADY PAID
    # -----------------------------
    def test_already_paid(self):
        self.booking.payment_status = "PAID"
        self.booking.save()

        response = self.client.post("/api/payments/create/", {
            "booking_id": self.booking.id,
            "payment_type": "FULL"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ✅ VERIFY PAYMENT SUCCESS
    # -----------------------------
    @patch("payments.views.razorpay.Client")
    @patch("payments.views.update_booking_after_payment")
    def test_verify_payment_success(self, mock_update, mock_razorpay):

        payment = Payment.objects.create(
            booking=self.booking,
            razorpay_order_id="order_test_123",
            amount=100,
            payment_type="FULL",
            status="CREATED"
        )

        mock_client = mock_razorpay.return_value
        mock_client.utility.verify_payment_signature.return_value = True

        response = self.client.post("/api/payments/verify/", {
            "order_id": "order_test_123",
            "payment_id": "pay_123",
            "signature": "valid_signature"
        })

        payment.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(payment.status, "SUCCESS")

    # -----------------------------
    # ❌ VERIFY FAILED
    # -----------------------------
    @patch("payments.views.razorpay.Client")
    def test_verify_payment_fail(self, mock_razorpay):

        payment = Payment.objects.create(
            booking=self.booking,
            razorpay_order_id="order_test_123",
            amount=100,
            payment_type="FULL",
            status="CREATED"
        )

        mock_client = mock_razorpay.return_value
        mock_client.utility.verify_payment_signature.side_effect = Exception()

        response = self.client.post("/api/payments/verify/", {
            "order_id": "order_test_123",
            "payment_id": "pay_123",
            "signature": "invalid"
        })

        payment.refresh_from_db()

        self.assertEqual(response.status_code, 400)
        self.assertEqual(payment.status, "FAILED")

    # -----------------------------
    # ❌ VERIFY MISSING DATA
    # -----------------------------
    def test_verify_missing_data(self):
        response = self.client.post("/api/payments/verify/", {})

        self.assertEqual(response.status_code, 400)