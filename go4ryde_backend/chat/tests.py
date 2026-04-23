from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from django.urls import reverse
from django.utils.timezone import now
from datetime import timedelta
from accounts.models import User
from rides.models import Ride
from chat.models import ChatRoom, Message


class ChatTest(APITestCase):

    def setUp(self):
        # Users
        self.driver = User.objects.create(email="driver@test.com", phone="111", role="DRIVER")
        self.passenger = User.objects.create(email="user@test.com", phone="222", role="PASSENGER")
        self.other_user = User.objects.create(email="other@test.com", phone="333", role="PASSENGER")

        # Tokens
        self.driver_token = str(RefreshToken.for_user(self.driver).access_token)
        self.passenger_token = str(RefreshToken.for_user(self.passenger).access_token)

        # Ride
        self.ride = Ride.objects.create(
            driver=self.driver,
            source="A",
            destination="B",
            source_lat=1,
            source_lng=1,
            destination_lat=2,
            destination_lng=2,
            seats_available=3,
            price_per_seat=100,
            status="ACTIVE",
            date_time=now() + timedelta(hours=1)   # ✅ ADD THIS
        )

        # Chat room
        self.room = ChatRoom.objects.create(ride=self.ride)
        self.room.participants.add(self.driver, self.passenger)

        # Messages
        self.message = Message.objects.create(
            room=self.room,
            sender=self.passenger,
            text="Hello driver"
        )

    # -------------------------
    # 📥 GET MESSAGES
    # -------------------------
    def test_get_chat_messages(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        url = reverse("chat:get_messages", args=[self.ride.id])

        res = self.client.get(url)

        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)

    def test_get_messages_not_allowed(self):
        token = str(RefreshToken.for_user(self.other_user).access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        url = reverse("chat:get_messages", args=[self.ride.id])

        res = self.client.get(url)

        self.assertEqual(res.status_code, 403)

    # -------------------------
    # 👁️ MARK READ
    # -------------------------
    def test_mark_messages_read(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.driver_token}")

        url = reverse("chat:mark_read", args=[self.ride.id])

        res = self.client.post(url)

        self.message.refresh_from_db()

        self.assertEqual(res.status_code, 200)
        self.assertTrue(self.message.is_read)

    # -------------------------
    # 📤 SEND MESSAGE
    # -------------------------
    def test_send_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        url = reverse("chat:send_message", args=[self.ride.id])

        res = self.client.post(url, {
            "message": "Hello again"
        }, format="json")

        self.assertEqual(res.status_code, 200)
        self.assertEqual(Message.objects.count(), 2)

    def test_send_empty_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        url = reverse("chat:send_message", args=[self.ride.id])

        res = self.client.post(url, {
            "message": ""
        }, format="json")

        self.assertEqual(res.status_code, 400)

    def test_send_long_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        url = reverse("chat:send_message", args=[self.ride.id])

        res = self.client.post(url, {
            "message": "a" * 600
        }, format="json")

        self.assertEqual(res.status_code, 400)

    def test_send_blocked_message(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        url = reverse("chat:send_message", args=[self.ride.id])

        res = self.client.post(url, {
            "message": "this is spam"
        }, format="json")

        self.assertEqual(res.status_code, 400)

    def test_send_phone_before_start(self):
        self.ride.status = "PENDING"
        self.ride.save()

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.passenger_token}")

        url = reverse("chat:send_message", args=[self.ride.id])

        res = self.client.post(url, {
            "message": "Call me 9876543210"
        }, format="json")

        self.assertEqual(res.status_code, 400)