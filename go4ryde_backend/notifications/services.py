from importlib.metadata import metadata

from .models import Notification
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

class NotificationService:

    @staticmethod
    def notify(
        user,
        title,
        message,
        notification_type,
        priority="MEDIUM",
        metadata=None
    ):

      
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            metadata=metadata or {}
        )

        channel_layer = get_channel_layer()

        async_to_sync(
            channel_layer.group_send
        )(
            f"user_{user.id}",
            {
                "type": "send_notification",
                "data": {
    "id": notification.id,
    "title": notification.title,
    "message": notification.message,
    "notification_type": notification.notification_type,
    "priority": notification.priority,
    "metadata": notification.metadata,
}
            }
        )

        return notification