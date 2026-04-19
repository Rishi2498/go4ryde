# chat/consumers.py
from channels.db import database_sync_to_async  # ✅ REQUIRED
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from .models import ChatRoom, Message
from rides.models import Ride
from bookings.models import Booking
from .utils import can_chat


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        self.ride_id = self.scope["url_route"]["kwargs"]["ride_id"]
        self.room_group_name = f"chat_{self.ride_id}"

        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        # DB fetch
        ride = await self.get_ride()
        booking = await self.get_booking()

        allowed, _ = can_chat(self.user, ride, booking)

        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message")

        if not message or len(message) > 500:
            return

        # 🚫 Basic spam / abuse filter
        if any(word in message.lower() for word in ["abuse", "spam"]):
            return

        ride = await self.get_ride()
        booking = await self.get_booking()

        allowed, _ = can_chat(self.user, ride, booking)
        if not allowed:
            return

        msg_obj = await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": self.user.id,
                "timestamp": str(msg_obj.created_at),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    # ---------------- DB HELPERS ---------------- #

    async def get_ride(self):
        return await database_sync_to_async(Ride.objects.get)(id=self.ride_id)

    async def get_booking(self):
        return await database_sync_to_async(
            Booking.objects.filter(ride_id=self.ride_id, user=self.user).first
        )()

    async def save_message(self, message):
        room, _ = await database_sync_to_async(ChatRoom.objects.get_or_create)(
            ride_id=self.ride_id,
            driver_id=(await self.get_ride()).driver_id,
            passenger_id=self.user.id if self.user != (await self.get_ride()).driver else None
        )

        return await database_sync_to_async(Message.objects.create)(
            room=room,
            sender=self.user,
            text=message
        )