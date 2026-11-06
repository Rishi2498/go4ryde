from rest_framework.test import APITestCase
from chat.models import Message
from core.factories import UserFactory, RideFactory, ChatRoomFactory


class ChatTestCase(APITestCase):

    def setUp(self):
        self.driver = UserFactory()
        self.passenger = UserFactory()

        self.ride = RideFactory(driver=self.driver)

        self.room = ChatRoomFactory(ride=self.ride)
        self.room.participants.add(self.driver, self.passenger)

        self.client.force_authenticate(user=self.passenger)

    # -----------------------------
    # 🖨️ HELPER: PRINT CHAT STATE
    # -----------------------------
    def print_chat(self, label=""):
        print(f"\n📨 ===== {label} =====")
        for msg in Message.objects.all():
            print(f"{msg.sender.email} ➜ {msg.text} | read={msg.is_read}")
        print("📨 =====================\n")

    # -----------------------------
    # ✅ SEND MESSAGE
    # -----------------------------
    def test_send_message_success(self):
        response = self.client.post(
            f"/api/chat/send/{self.ride.id}/",
            {"message": "Hello driver"}
        )

        print("Response:", response.data)
        self.print_chat("After Send")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Message.objects.count(), 1)

    # -----------------------------
    # ❌ EMPTY MESSAGE BLOCK
    # -----------------------------
    def test_send_empty_message(self):
        response = self.client.post(
            f"/api/chat/send/{self.ride.id}/",
            {"message": ""}
        )

        print("Empty Response:", response.data)

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ SPAM BLOCK
    # -----------------------------
    def test_spam_block(self):
        for i in range(5):
            self.client.post(
                f"/api/chat/send/{self.ride.id}/",
                {"message": "spam"}
            )

        response = self.client.post(
            f"/api/chat/send/{self.ride.id}/",
            {"message": "spam"}
        )

        self.print_chat("Spam Test")

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ PHONE NUMBER BLOCK
    # -----------------------------
    def test_phone_block(self):
        response = self.client.post(
            f"/api/chat/send/{self.ride.id}/",
            {"message": "Call me 9876543210"}
        )

        print("Phone Block:", response.data)

        self.assertEqual(response.status_code, 400)

    # -----------------------------
    # ❌ UNAUTHORIZED USER
    # -----------------------------
    def test_unauthorized_user(self):
        stranger = UserFactory()
        self.client.force_authenticate(user=stranger)

        response = self.client.post(
            f"/api/chat/send/{self.ride.id}/",
            {"message": "hack"}
        )

        print("Unauthorized:", response.data)

        self.assertEqual(response.status_code, 403)

    # -----------------------------
    # ✅ GET MESSAGES
    # -----------------------------
    def test_get_messages(self):
        Message.objects.create(
            room=self.room,
            sender=self.passenger,
            text="Hi"
        )

        response = self.client.get(f"/api/chat/{self.ride.id}/")

        print("Messages API:", response.data)
        self.print_chat("Get Messages")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

    # -----------------------------
    # ✅ MARK AS READ
    # -----------------------------
    def test_mark_read(self):
        msg = Message.objects.create(
            room=self.room,
            sender=self.driver,
            text="Hello",
            is_read=False
        )

        self.print_chat("Before Read")

        self.client.post(f"/api/chat/read/{self.ride.id}/")

        msg.refresh_from_db()

        self.print_chat("After Read")

        self.assertTrue(msg.is_read)