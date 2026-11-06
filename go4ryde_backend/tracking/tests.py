from rest_framework.test import APITestCase
from django.core.cache import cache
from core.factories import UserFactory, RideFactory
from tracking.models import DriverLocation


class TrackingTestCase(APITestCase):

    def setUp(self):
        self.driver = UserFactory(role="DRIVER")
        self.passenger = UserFactory()

        self.ride = RideFactory(driver=self.driver)
        self.ride.status = "ACTIVE"
        self.ride.save()

        self.url_update = "/api/tracking/update-location/"
        self.url_get = f"/api/tracking/driver-location/{self.ride.id}/"

        cache.clear()

    # -----------------------------
    # ✅ UPDATE LOCATION SUCCESS
    # -----------------------------
    def test_update_location_success(self):
        self.client.force_authenticate(user=self.driver)

        response = self.client.post(self.url_update, {
            "ride_id": self.ride.id,
            "lat": 17.1,
            "lng": 78.1
        })

        self.assertEqual(response.status_code, 200)
        self.assertEqual(DriverLocation.objects.count(), 1)

    # -----------------------------
    # ❌ MISSING DATA
    # -----------------------------
    def test_update_location_missing_data(self):
        self.client.force_authenticate(user=self.driver)

        response = self.client.post(self.url_update, {})

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ INVALID DATA FORMAT
    # -----------------------------
    def test_update_location_invalid_format(self):
        self.client.force_authenticate(user=self.driver)

        response = self.client.post(self.url_update, {
            "ride_id": "abc",
            "lat": "xyz",
            "lng": "test"
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ NOT DRIVER
    # -----------------------------
    def test_update_location_not_driver(self):
        self.client.force_authenticate(user=self.passenger)

        response = self.client.post(self.url_update, {
            "ride_id": self.ride.id,
            "lat": 17,
            "lng": 78
        })

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ❌ RIDE NOT ACTIVE
    # -----------------------------
    def test_update_location_inactive_ride(self):
        self.client.force_authenticate(user=self.driver)

        self.ride.status = "CREATED"
        self.ride.save()

        response = self.client.post(self.url_update, {
            "ride_id": self.ride.id,
            "lat": 17,
            "lng": 78
        })

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ RATE LIMIT (CACHE)
    # -----------------------------
    def test_update_location_throttle(self):
        self.client.force_authenticate(user=self.driver)

        # first request
        self.client.post(self.url_update, {
            "ride_id": self.ride.id,
            "lat": 17,
            "lng": 78
        })

        # immediate second request → should be blocked
        response = self.client.post(self.url_update, {
            "ride_id": self.ride.id,
            "lat": 17,
            "lng": 78
        })

        self.assertEqual(response.status_code, 429)

    # -----------------------------
    # ✅ GET DRIVER LOCATION
    # -----------------------------
    def test_get_driver_location(self):
        DriverLocation.objects.create(
            ride=self.ride,
            driver=self.driver,
            lat=17,
            lng=78
        )

        response = self.client.get(self.url_get)

        self.assertEqual(response.status_code, 200)
        self.assertIn("lat", response.data)

    # -----------------------------
    # ❌ LOCATION NOT FOUND
    # -----------------------------
    def test_get_driver_location_not_found(self):
        response = self.client.get(self.url_get)

        self.assertEqual(response.status_code, 404)