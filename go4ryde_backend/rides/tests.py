from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import User
from rides.models import Ride
from bookings.models import Booking
from rest_framework_simplejwt.tokens import RefreshToken

from core.models import PlatformFee


class RideFlowTest(APITestCase):

    def setUp(self):
        PlatformFee.objects.get_or_create(percentage=10)

        # 🔥 CREATE USERS
        self.driver = User.objects.create(email="driver@test.com", phone="1111111111", role="DRIVER")
        self.passenger = User.objects.create(email="pass@test.com", phone="2222222222", role="PASSENGER")

        # 🔐 TOKENS
        self.driver_token = str(RefreshToken.for_user(self.driver).access_token)
        self.passenger_token = str(RefreshToken.for_user(self.passenger).access_token)

        # 🔗 URLs
        self.create_ride_url = "/api/rides/"
        self.search_url = "/api/rides/search/"

    # ============================
    # 🚀 CREATE RIDE TEST
    # ============================
    def test_create_ride(self):

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.driver_token}")

        data = {
            "source": "A",
            "destination": "B",
            "source_lat": 10.0,
            "source_lng": 20.0,
            "destination_lat": 11.0,
            "destination_lng": 21.0,
            "seats_available": 3,
            "price_per_seat": 100,
            "date_time": "2030-01-01T10:00:00Z"
        }

        res = self.client.post(self.create_ride_url, data)

        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Ride.objects.count(), 1)

    # ============================
    # 🔍 SEARCH TEST
    # ============================
    def test_search_rides(self):

        Ride.objects.create(
            driver=self.driver,
            source="A",
            destination="B",
            source_lat=10,
            source_lng=20,
            destination_lat=11,
            destination_lng=21,
            seats_available=3,
            price_per_seat=100,
            date_time="2030-01-01T10:00:00Z"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        res = self.client.post(self.search_url, {})

        self.assertEqual(res.status_code, 200)
        self.assertGreater(len(res.data), 0)

    # ============================
    # 🚀 BOOK RIDE TEST
    # ============================
    def test_booking_flow(self):

        ride = Ride.objects.create(
            driver=self.driver,
            source="A",
            destination="B",
            source_lat=10,
            source_lng=20,
            destination_lat=11,
            destination_lng=21,
            seats_available=3,
            price_per_seat=100,
            date_time="2030-01-01T10:00:00Z"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        res = self.client.post("/api/bookings/create/", {
            "ride": ride.id,
            "seats": 1
        })

        self.assertEqual(res.status_code, 200)
        self.assertEqual(Booking.objects.count(), 1)

    # ============================
    # ✅ ACCEPT BOOKING TEST
    # ============================
    def test_accept_booking(self):

        ride = Ride.objects.create(
            driver=self.driver,
            source="A",
            destination="B",
            source_lat=10,
            source_lng=20,
            destination_lat=11,
            destination_lng=21,
            seats_available=3,
            price_per_seat=100,
            date_time="2030-01-01T10:00:00Z"
        )

        booking = Booking.objects.create(
            ride=ride,
            user=self.passenger,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="PENDING",
            payment_status="PAID"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.driver_token}")

        res = self.client.post(f"/api/rides/accept/{booking.id}/")

        self.assertEqual(res.status_code, 200)

        booking.refresh_from_db()
        self.assertEqual(booking.status, "CONFIRMED")

    # ============================
    # 🚗 START RIDE TEST
    # ============================
    def test_start_ride(self):

        ride = Ride.objects.create(
            driver=self.driver,
            source="A",
            destination="B",
            source_lat=10,
            source_lng=20,
            destination_lat=11,
            destination_lng=21,
            seats_available=3,
            price_per_seat=100,
            date_time="2030-01-01T10:00:00Z"
        )

        booking = Booking.objects.create(
            ride=ride,
            user=self.passenger,
            seats=1,
            original_amount=100,
            final_amount=100,
            status="CONFIRMED",
            payment_status="PAID"
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.driver_token}")

        res = self.client.post(f"/api/rides/start/{booking.id}/")

        self.assertEqual(res.status_code, 200)

        booking.refresh_from_db()
        ride.refresh_from_db()

        self.assertEqual(booking.status, "STARTED")
        self.assertEqual(ride.status, "ACTIVE")