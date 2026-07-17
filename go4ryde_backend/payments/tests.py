from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from rides.models import Ride
from bookings.models import Booking
from payments.models import (
    Payment,
    Wallet,
    WalletTransaction,
    BankAccount,
    Withdrawal
)

User = get_user_model()


class PaymentFlowTests(APITestCase):

    def setUp(self):

        self.user = User.objects.create_user(
        phone="9999999991",
        email="user@test.com"
    )

        self.driver = User.objects.create_user(
            phone="9999999992",
            email="driver@test.com"
        )

        self.client.force_authenticate(
            self.user
        )


        self.ride = Ride.objects.create(
            driver=self.driver,

            source="Hyderabad",
            destination="Vijayawada",

            source_lat=17.3850,
            source_lng=78.4867,

            destination_lat=16.5062,
            destination_lng=80.6480,

            date_time=timezone.now(),

            seats_available=4,
            seats_booked=0,

            price_per_seat=500,

            status="CREATED"
        )

        self.booking = Booking.objects.create(
    user=self.user,
    ride=self.ride,

    seats=1,

    original_amount=Decimal("500"),   # ADD THIS

    final_amount=Decimal("500"),

    remaining_amount=Decimal("0"),

    payment_status="PENDING",

    status="PENDING"
)

    # ===================================================
    # CREATE PAYMENT TESTS
    # ===================================================

    def test_missing_data(self):

        response = self.client.post(
            "/api/payments/create/",
            {}
        )

        self.assertEqual(
            response.status_code,
            400
        )

    def test_invalid_payment_type(self):

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "INVALID"
            }
        )

        self.assertEqual(
            response.status_code,
            400
        )

    def test_booking_not_found(self):

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": 999999,
                "payment_type": "FULL"
            }
        )

        self.assertEqual(
            response.status_code,
            404
        )

    # ===================================================
    # FULL PAYMENT
    # ===================================================

    @patch("payments.views.razorpay.Client")
    def test_create_full_payment(
        self,
        mock_client
    ):

        mock_client.return_value.order.create.return_value = {
            "id": "order_test_123"
        }

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "FULL"
            }
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertEqual(
            response.data["order_id"],
            "order_test_123"
        )

        self.assertTrue(
            Payment.objects.filter(
                booking=self.booking
            ).exists()
        )

    # ===================================================
    # WALLET PAYMENT
    # ===================================================

    def test_wallet_insufficient_balance(self):

        wallet, _ = Wallet.objects.get_or_create(
    user=self.user
)
        wallet.balance = Decimal("1000")
        wallet.save()

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "WALLET"
            }
        )

        self.assertEqual(
            response.status_code,
            400
        )

    def test_wallet_payment_success(self):

        Wallet.objects.create(
            user=self.user,
            balance=Decimal("1000")
        )

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "WALLET"
            }
        )

        self.assertEqual(
            response.status_code,
            200
        )

        wallet = Wallet.objects.get(
            user=self.user
        )

        self.assertEqual(
            wallet.balance,
            Decimal("500")
        )

    # ===================================================
    # COD PAYMENT
    # ===================================================

    def test_cod_payment(self):

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "COD"
            }
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.booking.refresh_from_db()

        self.assertEqual(
            self.booking.payment_status,
            "Cash"
        )

    # ===================================================
    # VERIFY PAYMENT
    # ===================================================

    @patch("payments.views.NotificationDispatcher.trigger")
    @patch("payments.views.razorpay.Client")
    def test_verify_payment_success(
        self,
        mock_client,
        mock_notification
    ):

        payment = Payment.objects.create(
            booking=self.booking,
            amount=Decimal("500"),
            payment_type="FULL",
            status="CREATED",
            razorpay_order_id="order123"
        )

        response = self.client.post(
            "/api/payments/verify/",
            {
                "order_id": "order123",
                "payment_id": "pay123",
                "signature": "sig123"
            }
        )

        self.assertEqual(
            response.status_code,
            200
        )

        payment.refresh_from_db()

        self.assertEqual(
            payment.status,
            "SUCCESS"
        )

        self.assertTrue(
            mock_notification.called
        )

    # ===================================================
    # DRIVER WALLET CREDIT
    # ===================================================

    @patch("payments.views.NotificationDispatcher.trigger")
    @patch("payments.views.razorpay.Client")
    def test_driver_wallet_credit(
        self,
        mock_client,
        mock_notification
    ):

        Wallet.objects.create(
            user=self.driver,
            balance=Decimal("0")
        )

        payment = Payment.objects.create(
            booking=self.booking,
            amount=Decimal("500"),
            payment_type="FULL",
            status="CREATED",
            razorpay_order_id="order_driver"
        )

        self.client.post(
            "/api/payments/verify/",
            {
                "order_id": "order_driver",
                "payment_id": "pay123",
                "signature": "sig123"
            }
        )

        wallet = Wallet.objects.get(
            user=self.driver
        )

        self.assertEqual(
            wallet.balance,
            Decimal("500")
        )

    # ===================================================
    # PARTIAL PAYMENT
    # ===================================================

    @patch("payments.views.razorpay.Client")
    def test_partial_payment_create(
        self,
        mock_client
    ):

        mock_client.return_value.order.create.return_value = {
            "id": "partial123"
        }

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "PARTIAL"
            }
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertEqual(
            response.data["order_id"],
            "partial123"
        )

    # ===================================================
    # BANK ACCOUNT
    # ===================================================

    def test_save_bank_account(self):

        response = self.client.post(
            "/api/payments/save-bank-account/",
            {
                "account_holder_name": "John",
                "bank_name": "SBI",
                "account_number": "12345678",
                "ifsc_code": "SBIN0001234",
                "upi_id": "john@upi"
            }
        )

        self.assertEqual(
            response.status_code,
            200
        )

        self.assertTrue(
            BankAccount.objects.filter(
                user=self.user
            ).exists()
        )

    # ===================================================
    # WITHDRAWAL
    # ===================================================

    def test_wallet_withdrawal(self):

        bank = BankAccount.objects.create(
            user=self.user,
            account_holder_name="John",
            bank_name="SBI",
            account_number="123456",
            ifsc_code="SBIN000123"
        )

        Wallet.objects.create(
            user=self.user,
            balance=Decimal("1000")
        )

        response = self.client.post(
            "/api/payments/withdraw/",
            {
                "amount": "500"
            }
        )

        self.assertIn(
            response.status_code,
            [200, 201]
        )

    def test_withdraw_insufficient_balance(self):

        BankAccount.objects.create(
            user=self.user,
            account_holder_name="John",
            bank_name="SBI",
            account_number="123456",
            ifsc_code="SBIN000123"
        )

        Wallet.objects.create(
            user=self.user,
            balance=Decimal("100")
        )

        response = self.client.post(
            "/api/payments/withdraw/",
            {
                "amount": "500"
            }
        )

        self.assertEqual(
            response.status_code,
            400
        )

    # ===================================================
    # SECURITY TESTS
    # ===================================================

    def test_unauthorized_create_payment(self):

        self.client.logout()

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "FULL"
            }
        )

        self.assertIn(
            response.status_code,
            [401, 403]
        )

    def test_other_user_booking_payment(self):

        other = User.objects.create_user(
            email="other@test.com"
        )

        self.client.force_authenticate(
            other
        )

        response = self.client.post(
            "/api/payments/create/",
            {
                "booking_id": self.booking.id,
                "payment_type": "FULL"
            }
        )

        self.assertEqual(
            response.status_code,
            403
        )