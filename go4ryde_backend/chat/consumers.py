import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

from chat.models import ChatRoom, Message
from rides.models import Ride


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.user = self.scope["user"]
        self.ride_id = self.scope["url_route"]["kwargs"]["ride_id"]
        self.room_group_name = f"chat_{self.ride_id}"

        print("👤 CONNECT USER:", self.user)

        # ❌ Unauthorized
        if not self.user or isinstance(self.user, AnonymousUser):
            print("❌ Anonymous user")
            await self.close()
            return

        # ✅ Get room
        self.room = await self.get_room()

        if not self.room:
            print("❌ ChatRoom not found")
            await self.close()
            return

        # ✅ Permission check (NEW LOGIC)
        is_allowed = await self.is_participant()

        if not is_allowed:
            print("❌ Not allowed to chat")
            await self.close()
            return

        # ✅ Join group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        print("✅ WebSocket Connected")

    async def disconnect(self, close_code):
        print("❌ WebSocket Disconnected")

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)

        message = data.get("message")
        typing = data.get("typing")
        read = data.get("read")

        # ---------------------------
        # ⌨️ Typing Indicator
        # ---------------------------
        if typing is not None:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_event",
                    "user": self.user.id,
                    "typing": typing
                }
            )
            return

        # ---------------------------
        # 👁️ Read Receipt
        # ---------------------------
        if read:
            await self.mark_messages_read()

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "read_event",
                    "user": self.user.id
                }
            )
            return

        # ---------------------------
        # 💬 Message Handling
        # ---------------------------
        if not message or len(message) > 500:
            return

        if any(word in message.lower() for word in ["spam", "abuse"]):
            return

        # ✅ Double check permission
        if not await self.is_participant():
            return

        # ✅ Save message
        msg_obj = await self.save_message(message)

        # 📤 Broadcast message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "id": msg_obj.id,
                "message": msg_obj.text,
                "sender": self.user.id,
                "sender_email": self.user.email,
                "timestamp": str(msg_obj.created_at),
                "status": "sent"  # ✅ WhatsApp style
            }
        )

    # ---------------------------
    # 📤 EVENTS
    # ---------------------------

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def typing_event(self, event):
        await self.send(text_data=json.dumps(event))

    async def read_event(self, event):
        await self.send(text_data=json.dumps(event))

    # ---------------------------
    # 🧠 DB HELPERS
    # ---------------------------

    @database_sync_to_async
    def get_room(self):
        return ChatRoom.objects.filter(ride_id=self.ride_id).first()

    @database_sync_to_async
    def is_participant(self):
        return self.room.participants.filter(id=self.user.id).exists()

    @database_sync_to_async
    def save_message(self, message):
        return Message.objects.create(
            room=self.room,
            sender=self.user,
            text=message
        )

    @database_sync_to_async
    def mark_messages_read(self):
        Message.objects.filter(
            room=self.room
        ).exclude(sender=self.user).update(is_read=True)