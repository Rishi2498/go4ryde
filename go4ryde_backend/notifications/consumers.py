
import logging
from channels.generic.websocket import AsyncJsonWebsocketConsumer

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            logger.warning("WS rejected: user not authenticated")
            await self.close(code=4401)
            return

        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(
            self.group_name, self.channel_name
        )
        await self.accept()

        logger.info(
            "WS CONNECTED: user_id=%s group=%s",
            self.user.id, self.group_name
        )

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(
                self.group_name, self.channel_name
            )
            logger.info(
                "WS DISCONNECTED: user_id=%s code=%s",
                self.user.id, close_code
            )

    async def send_notification(self, event):
        logger.info("WS EVENT RECEIVED: %s", event)
        await self.send_json(event["data"])
