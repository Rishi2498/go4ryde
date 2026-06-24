from rest_framework.test import APITestCase
from unittest.mock import patch

from core.factories import UserFactory, RideFactory
from bookings.models import Booking
from chat.models import ChatRoom


class RideTestCase(APITestCase):

    def setUp(self):
        self.driver = UserFactory(role="DRIVER")
        self.passenger = UserFactory()

        self.client.force_authenticate(user=self.driver)

    # -----------------------------
    # ✅ CREATE RIDE (DRIVER)
    # -----------------------------
    @patch("rides.views.requests.get")
    def test_create_ride_success(self, mock_get):

        mock_get.return_value.json.return_value = {
            "status": "OK",
            "routes": [{
                "legs": [{
                    "distance": {"value": 10000},
                    "duration": {"value": 600}
                }],
                "overview_polyline": {"points": "abc"}
            }]
        }

        response = self.client.post("/api/rides/", {
            "source": "A",
            "source_lat": 17.0,
            "source_lng": 78.0,
            "destination": "B",
            "destination_lat": 18.0,
            "destination_lng": 79.0,
            "date_time": "2030-01-01T10:00:00Z",
            "price_per_seat": 100,
            "seats_available": 3
        },
        )


        self.assertEqual(response.status_code, 201)
        self.assertEqual(ChatRoom.objects.count(), 1)

    # -----------------------------
    # ❌ PASSENGER CANNOT CREATE
    # -----------------------------
    def test_create_ride_not_driver(self):
        self.client.force_authenticate(user=self.passenger)

        response = self.client.post("/api/rides/", {
            "source": "A",
            "destination": "B"
        })

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ✅ MY RIDES
    # -----------------------------
    def test_my_rides(self):
        RideFactory(driver=self.driver)

        response = self.client.get("/api/rides/my_rides/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    # -----------------------------
    # ✅ SEARCH RIDES
    # -----------------------------
    def test_search_rides(self):
        RideFactory(driver=self.driver)

        response = self.client.post("/api/rides/search/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(len(response.data) >= 1)

    # -----------------------------
    # ✅ CALCULATE ROUTE
    # -----------------------------
    @patch("rides.views.requests.get")
    def test_calculate_route(self, mock_get):

        mock_get.return_value.json.return_value = {
            "routes": [{
                "legs": [{
                    "distance": {"value": 10000},
                    "duration": {"value": 600}
                }]
            }]
        }

        response = self.client.post(
            "/api/rides/calculate-route/",
            {
                "source": {"lat": 17, "lng": 78},
                "destination": {"lat": 18, "lng": 79}
            },
            format="json"   # 🔥 REQUIRED
        )

        self.assertEqual(response.status_code, 200)


    def test_calculate_route_invalid(self):
        response = self.client.post(
            "/api/rides/calculate-route/",
            {},
            format="json"   # 🔥 REQUIRED
        )

        self.assertEqual(response.status_code, 400)
    # -----------------------------
    # ✅ ACCEPT BOOKING
    # -----------------------------
    def test_accept_booking(self):
        ride = RideFactory(driver=self.driver)

        booking = Booking.objects.create(
            user=self.passenger,
            ride=ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status=["PAID", "Cash"],
        )

        response = self.client.post(f"/api/rides/accept/{booking.id}/")

        booking.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(booking.status, "CONFIRMED")

    # -----------------------------
    # ❌ ACCEPT NOT DRIVER
    # -----------------------------
    def test_accept_not_driver(self):
        ride = RideFactory(driver=self.driver)

        booking = Booking.objects.create(
            user=self.passenger,
            ride=ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PAID"
        )

        self.client.force_authenticate(user=self.passenger)

        response = self.client.post(f"/api/rides/accept/{booking.id}/")

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ❌ ACCEPT WITHOUT PAYMENT
    # -----------------------------
    def test_accept_without_payment(self):
        ride = RideFactory(driver=self.driver)

        booking = Booking.objects.create(
            user=self.passenger,
            ride=ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PENDING"
        )

        response = self.client.post(f"/api/rides/accept/{booking.id}/")

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ✅ START RIDE
    # -----------------------------
    def test_start_ride(self):
        ride = RideFactory(driver=self.driver)

        booking = Booking.objects.create(
            user=self.passenger,
            ride=ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PAID",
            status="CONFIRMED"
        )

        response = self.client.post(f"/api/rides/start/{booking.id}/")

        booking.refresh_from_db()
        ride.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(booking.status, "STARTED")
        self.assertEqual(ride.status, "ACTIVE")

    # -----------------------------
    # ❌ START NOT DRIVER
    # -----------------------------
    def test_start_not_driver(self):
        ride = RideFactory(driver=self.driver)

        booking = Booking.objects.create(
            user=self.passenger,
            ride=ride,
            seats=1,
            original_amount=100,
            final_amount=100,
            payment_status="PAID",
            status="CONFIRMED"
        )

        self.client.force_authenticate(user=self.passenger)

        response = self.client.post(f"/api/rides/start/{booking.id}/")

        self.assertEqual(response.status_code, 403)