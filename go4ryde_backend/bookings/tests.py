from rest_framework.test import APITestCase
from django.urls import reverse
from django.core.cache import cache

from core.factories import UserFactory, RideFactory
from bookings.models import Booking


class BookingTestCase(APITestCase):

    def setUp(self):
        cache.clear()

        self.driver = UserFactory(role="DRIVER")
        self.user = UserFactory()

        self.ride = RideFactory(driver=self.driver)

        self.client.force_authenticate(user=self.user)

    # -----------------------------
    # ✅ CREATE BOOKING
    # -----------------------------
    def test_create_booking_success(self):
        response = self.client.post("/api/bookings/create/", {
            "ride": self.ride.id,
            "seats": 1
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Booking.objects.count(), 1)

    # -----------------------------
    # ❌ DRIVER CANNOT BOOK
    # -----------------------------
    def test_driver_cannot_book(self):
        self.client.force_authenticate(user=self.driver)

        response = self.client.post("/api/bookings/create/", {
            "ride": self.ride.id,
            "seats": 1
        })

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ❌ INVALID SEATS
    # -----------------------------
    def test_booking_no_seats(self):
        self.ride.seats_available = 0
        self.ride.save()

        response = self.client.post("/api/bookings/create/", {
            "ride": self.ride.id,
            "seats": 1
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ✅ MY BOOKINGS
    # -----------------------------
    def test_my_bookings(self):
        Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100
        )

        response = self.client.get("/api/bookings/my-bookings/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    # -----------------------------
    # ✅ CANCEL BOOKING
    # -----------------------------
    def test_cancel_booking(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="CONFIRMED",
            payment_status="PAID"
        )

        response = self.client.post(f"/api/bookings/cancel/{booking.id}/")

        booking.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(booking.status, "CANCELLED")

    # -----------------------------
    # ❌ CANCEL ALREADY CANCELLED
    # -----------------------------
    def test_cancel_already_cancelled(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="CANCELLED"
        )

        response = self.client.post(f"/api/bookings/cancel/{booking.id}/")

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ✅ DRIVER ACCEPT BOOKING
    # -----------------------------
    def test_accept_booking(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PAID"
        )

        self.client.force_authenticate(user=self.driver)

        response = self.client.post(f"/api/bookings/accept/{booking.id}/")

        booking.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(booking.status, "CONFIRMED")

    # -----------------------------
    # ❌ ACCEPT BY NON-DRIVER
    # -----------------------------
    def test_accept_not_driver(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PAID"
        )

        response = self.client.post(f"/api/bookings/accept/{booking.id}/")

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ❌ ACCEPT WITHOUT PAYMENT
    # -----------------------------
    def test_accept_without_payment(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PENDING"
        )

        self.client.force_authenticate(user=self.driver)

        response = self.client.post(f"/api/bookings/accept/{booking.id}/")

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ✅ START RIDE
    # -----------------------------
    def test_start_ride(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="CONFIRMED",
            payment_status="PAID"
        )

        self.client.force_authenticate(user=self.driver)

        response = self.client.post(f"/api/bookings/start/{booking.id}/")

        booking.refresh_from_db()
        self.ride.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(booking.status, "STARTED")
        self.assertEqual(self.ride.status, "ACTIVE")

    # -----------------------------
    # ❌ START RIDE NOT DRIVER
    # -----------------------------
    def test_start_ride_not_driver(self):
        booking = Booking.objects.create(
            user=self.user,
            ride=self.ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="CONFIRMED",
            payment_status="PAID"
        )

        response = self.client.post(f"/api/bookings/start/{booking.id}/")

        self.assertEqual(response.status_code, 403)