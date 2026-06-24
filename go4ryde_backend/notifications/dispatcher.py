from notifications.services import NotificationService
from notifications.models import (
    NotificationTemplate,
    NotificationRule
)


def resolve_path(obj, path):

    try:

        current = obj

        for attr in path.split("."):
            current = getattr(current, attr)

        return current

    except AttributeError:

        print(
            f"❌ Invalid receiver path: {path}"
        )

        return None


class NotificationDispatcher:

    @staticmethod
    def trigger(
        event,
        instance,
        **context
    ):

        print(
            f"🔔 Notification Event: {event}"
        )

        template = NotificationTemplate.objects.filter(
            event=event,
            is_active=True
        ).first()

        if not template:

            print(
                f"❌ No template found for {event}"
            )

            return

        rule = NotificationRule.objects.filter(
            event=event,
            is_active=True
        ).first()

        if not rule:

            print(
                f"❌ No rule found for {event}"
            )

            return

        receiver = resolve_path(
            instance,
            rule.receiver_path
        )

        if not receiver:

            print(
                f"❌ Receiver not found for {event}"
            )

            return

        try:

            message = template.message_template.format(
                **context
            )

        except KeyError as e:

            print(
                f"❌ Template variable missing: {e}"
            )

            print(
                "Template:",
                template.message_template
            )

            print(
                "Context:",
                context
            )

            return

        except Exception as e:

            print(
                f"❌ Notification format error: {e}"
            )

            return

        print(
            f"✅ Sending notification to {receiver}"
        )

        NotificationService.notify(
            user=receiver,
            title=template.title,
            message=message,
            notification_type=template.notification_type,
            priority=template.priority,
            metadata=context.get(
                "metadata",
                {}
            )
        )