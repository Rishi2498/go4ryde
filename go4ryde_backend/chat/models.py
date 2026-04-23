# chat/models.py

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


# ✅ ONE ROOM PER RIDE (GROUP CHAT)
class ChatRoom(models.Model):
    ride = models.OneToOneField(
        "rides.Ride",
        on_delete=models.CASCADE,
        related_name="chat_room"
    )

    participants = models.ManyToManyField(
        User,
        related_name="chat_rooms"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ride {self.ride.id} ChatRoom"


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

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender} → {self.text[:20]}"