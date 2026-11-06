
import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from .fcm import send_push_notification
from .models import Notification

logger = logging.getLogger(__name__)


class NotificationService:

    @staticmethod
    def notify(
        user,
        title,
        message,
        notification_type,
        priority="MEDIUM",
        metadata=None,
    ):
        if user is None or not user.is_authenticated:
            return None

        def create_and_send():
            try:
                notification = Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    notification_type=notification_type,
                    priority=priority,
                    metadata=metadata or {},
                )
            except Exception:
                logger.exception(
                    "Failed to save notification for user %s",
                    user.id,
                )
                return

            
            # Send WebSocket notification if a channel layer exists.
            channel_layer = get_channel_layer()

            if channel_layer is not None:
                try:
                    async_to_sync(channel_layer.group_send)(
                        f"user_{user.id}",
                        {
                            "type": "send_notification",
                            "data": {
                                "id": notification.id,
                                "title": notification.title,
                                "message": notification.message,
                                "notification_type":
                                    notification.notification_type,
                                "priority": notification.priority,
                                "is_read": notification.is_read,
                                "metadata": notification.metadata or {},
                                "created_at":
                                    notification.created_at.isoformat(),
                            },
                        },
                    )
                except Exception:
                    logger.exception(
                        "WebSocket delivery failed for notification %s",
                        notification.id,
                    )

            # Send Android/iOS push independently of WebSockets.
            try:
                send_push_notification(
                    user=user,
                    title=notification.title,
                    message=notification.message,
                    metadata=notification.metadata or {},
                )
            except Exception:
                logger.exception(
                    "Push delivery failed for notification %s",
                    notification.id,
                )

        transaction.on_commit(create_and_send)
        return True
