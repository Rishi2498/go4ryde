from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import User
from rides.models import Ride
from tracking.models import DriverLocation
from django.utils.timezone import now
from datetime import timedelta
from core.models import PlatformFee
from django.urls import reverse


class TrackingTest(APITestCase):

    def setUp(self):
        PlatformFee.objects.get_or_create(percentage=10)

        # ✅ CREATE DRIVER
        self.driver = User.objects.create(
            email="driver@test.com",
            phone="123",
            role="DRIVER"
        )

        # 🔐 TOKEN
        self.token = str(RefreshToken.for_user(self.driver).access_token)

        # 🚗 CREATE RIDE (FIXED)
        self.ride = Ride.objects.create(
            driver=self.driver,   # ✅ FIXED HERE
            source="A",
            destination="B",
            source_lat=1,
            source_lng=1,
            destination_lat=2,
            destination_lng=2,
            seats_available=3,
            price_per_seat=100,
            status="ACTIVE",
            date_time=now() + timedelta(hours=1)   # ✅ REQUIRED
        )

    # -------------------------
    # 🚗 TEST UPDATE LOCATION
    # -------------------------
    def test_update_location(self):

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

        url = reverse("tracking:update_location")
        res = self.client.post(url, {
            "ride_id": self.ride.id,
            "lat": 17.385,
            "lng": 78.4867
        }, format="json")

        # GET LOCATION
        url = reverse("tracking:get_driver_location", args=[self.ride.id])
        res = self.client.get(url)

        print("UPDATE RESPONSE:", res.data)  # 🔍 debug

        self.assertEqual(res.status_code, 200)
        self.assertEqual(DriverLocation.objects.count(), 1)
    
    def test_unauthorized_driver_cannot_update(self):
        other_user = User.objects.create(email="other@test.com", phone="999")

        token = str(RefreshToken.for_user(other_user).access_token)

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        url = reverse("tracking:update_location")
        res = self.client.post(url, {
        "ride_id": self.ride.id,
        "lat": 17,
        "lng": 78
        })

        self.assertEqual(res.status_code, 403)
    # -------------------------
    # 📍 TEST GET LOCATION
    # -------------------------
    def test_get_location(self):

        # ✅ CREATE LOCATION
        DriverLocation.objects.create(
            ride=self.ride,
            driver=self.driver,
            lat=17,
            lng=78
        )

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        url = reverse("tracking:get_driver_location", args=[self.ride.id])
        res = self.client.get(url)

        print("GET RESPONSE:", res.data)  # 🔍 debug

        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["lat"], 17)