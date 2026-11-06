
import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from tracking.access import can_access_ride


class RideTrackingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.ride_id = int(
            self.scope["url_route"]["kwargs"]["ride_id"]
        )
        self.group_name = f"ride_{self.ride_id}"

        user = self.scope.get("user")

        authorized = await database_sync_to_async(can_access_ride)(
            user, self.ride_id
        )

        if not authorized:
            await self.close(code=4403)
            return

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name,
        )

        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name,
            )

    async def receive(self, text_data=None, bytes_data=None):
        # Clients must not publish their own driver coordinates.
        # Location updates are accepted through the authenticated API.
        await self.close(code=4400)

    async def send_location(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "ride_id": event["ride_id"],
                    "lat": event["lat"],
                    "lng": event["lng"],
                }
            )
        )
