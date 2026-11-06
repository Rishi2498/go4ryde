from django.core.management.base import BaseCommand

from notifications.models import (
    NotificationTemplate,
    NotificationRule,
)

from notifications.notification_events import NOTIFICATION_EVENTS


class Command(BaseCommand):
    help = "Create or update GO4RYDE notification templates and rules."

    def handle(self, *args, **options):

        created_templates = 0
        updated_templates = 0
        created_rules = 0
        updated_rules = 0

        for event, config in NOTIFICATION_EVENTS.items():

            # ==============================
            # NOTIFICATION TEMPLATE
            # ==============================

            template, created = NotificationTemplate.objects.update_or_create(
                event=event,
                defaults={
                    "title": config["title"],
                    "message_template": config["message"],
                    "notification_type": config["notification_type"],
                    "priority": config["priority"],
                    "is_active": True,
                },
            )

            if created:
                created_templates += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✓ Template created: {event}"
                    )
                )
            else:
                updated_templates += 1
                self.stdout.write(
                    f"↻ Template updated: {event}"
                )

            # ==============================
            # NOTIFICATION RULE
            # ==============================

            receivers = config.get("receivers", [])

            if not receivers:
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠ No receiver configured: {event}"
                    )
                )
                continue

            # Current NotificationRule model supports
            # one receiver path per event.
            receiver_path = receivers[0]

            rule, created = NotificationRule.objects.update_or_create(
                event=event,
                defaults={
                    "receiver_path": receiver_path,
                    "is_active": True,
                },
            )

            if created:
                created_rules += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f"✓ Rule created: {event} → {receiver_path}"
                    )
                )
            else:
                updated_rules += 1
                self.stdout.write(
                    f"↻ Rule updated: {event} → {receiver_path}"
                )

        # ==============================
        # SUMMARY
        # ==============================

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                " Notification sync completed"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )

        self.stdout.write(
            f"Templates created : {created_templates}"
        )

        self.stdout.write(
            f"Templates updated : {updated_templates}"
        )

        self.stdout.write(
            f"Rules created     : {created_rules}"
        )

        self.stdout.write(
            f"Rules updated     : {updated_rules}"
        )