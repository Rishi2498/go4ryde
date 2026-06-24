# chat/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


## chat/models.py

class ChatRoom(models.Model):

    booking = models.OneToOneField(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="chat_room"
    )

    driver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="driver_chats"
    )

    passenger = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="passenger_chats"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.driver} ↔ {self.passenger}"


# ✅ MESSAGES
class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    text = models.TextField(max_length=500)

    # ✅ DELIVERY STATES (WhatsApp style)
    is_delivered = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True,db_index=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender} → {self.text[:20]}"