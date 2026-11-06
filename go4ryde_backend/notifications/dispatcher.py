
import logging

from notifications.services import NotificationService
from notifications.models import (
    NotificationTemplate,
    NotificationRule,
)

logger = logging.getLogger(__name__)


def resolve_path(obj, path):
    """
    Resolve a related object using a dot-separated path.
    Example: instance.ride.driver
    """
    try:
        current = obj

        for attr in path.split("."):
            current = getattr(current, attr)

        return current

    except AttributeError:
        logger.error("Invalid receiver path: %s", path)
        return None


class NotificationDispatcher:

    @staticmethod
    def trigger(event, instance, **context):
        """
        Send a notification using a database template
        and receiver rule.
        """
        logger.info("Notification event: %s", event)

        template = NotificationTemplate.objects.filter(
            event=event,
            is_active=True,
        ).first()

        if not template:
            logger.warning("No active template found for %s", event)
            return None

        rule = NotificationRule.objects.filter(
            event=event,
            is_active=True,
        ).first()

        if not rule:
            logger.warning("No active rule found for %s", event)
            return None

        receiver = resolve_path(instance, rule.receiver_path)

        if receiver is None:
            logger.warning("Receiver not found for event %s", event)
            return None

        if not hasattr(receiver, "is_authenticated"):
            logger.warning(
                "Receiver for %s is not a user object",
                event,
            )
            return None

        if not receiver.is_authenticated:
            logger.warning(
                "Receiver for %s is not authenticated",
                event,
            )
            return None

        try:
            message = template.message_template.format(**context)

        except KeyError:
            logger.exception(
                "Missing template variable for event %s. Context keys: %s",
                event,
                list(context.keys()),
            )
            return None

        except (ValueError, AttributeError, IndexError):
            logger.exception(
                "Could not format notification for event %s",
                event,
            )
            return None

        logger.info(
            "Sending %s notification to user %s",
            event,
            receiver.pk,
        )

        return NotificationService.notify(
            user=receiver,
            title=template.title,
            message=message,
            notification_type=template.notification_type,
            priority=template.priority,
            metadata=context.get("metadata") or {},
        )

    @staticmethod
    def trigger_chat_message(message):
        """
        Notify the other participant when a chat message is sent.

        Message -> ChatRoom -> driver/passenger.
        The sender does not receive their own message notification.
        """
        room = message.room
        sender = message.sender

        if sender.pk == room.driver_id:
            receiver = room.passenger

        elif sender.pk == room.passenger_id:
            receiver = room.driver

        else:
            logger.warning(
                "Chat notification skipped: user %s is not a participant "
                "in chat room %s",
                sender.pk,
                room.pk,
            )
            return None

        # Do not create a notification for the sender.
        if receiver.pk == sender.pk:
            return None

        logger.info(
            "New chat message: sender=%s receiver=%s booking=%s",
            sender.pk,
            receiver.pk,
            room.booking_id,
        )

        return NotificationService.notify(
            user=receiver,
            title="New message",
            message=f"{sender.username} sent you a message.",
            notification_type="CHAT",
            priority="MEDIUM",
            metadata={
                "route": f"/chat/{room.booking_id}",
                "booking_id": room.booking_id,
                "message_id": message.pk,
            },
        )
