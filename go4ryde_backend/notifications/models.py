from django.db import models
from django.conf import settings


class Notification(models.Model):

    NOTIFICATION_TYPES = [

        ("BOOKING", "BOOKING"),
        ("PAYMENT", "PAYMENT"),
        ("WALLET", "WALLET"),
        ("WITHDRAWAL", "WITHDRAWAL"),
        ("CHAT", "CHAT"),
        ("RIDE", "RIDE"),
        ("SYSTEM", "SYSTEM"),
    ]

    PRIORITY_LEVELS = [

        ("LOW", "LOW"),
        ("MEDIUM", "MEDIUM"),
        ("HIGH", "HIGH"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_LEVELS,
        default="MEDIUM"
    )

    is_read = models.BooleanField(default=False)

    metadata = models.JSONField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

class FCMDeviceToken(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fcm_device_tokens",
    )
    token = models.TextField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"FCM token for user {self.user_id}"


    
class NotificationTemplate(models.Model):

    event = models.CharField(
        max_length=100,
        unique=True
    )

    title = models.CharField(
        max_length=255
    )

    message_template = models.TextField()

    notification_type = models.CharField(
        max_length=30
    )

    priority = models.CharField(
        max_length=20,
        default="MEDIUM"
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.event
    
class NotificationRule(models.Model):

    event = models.CharField(
        max_length=100,
        unique=True
    )

    receiver_path = models.CharField(
        max_length=255
    )

    is_active = models.BooleanField(
        default=True
    )

    def __str__(self):
        return self.event
    
class NotificationAction(models.Model):

    event = models.CharField(max_length=100)

    action_type = models.CharField(
        max_length=30,
        choices=[
            ("EMAIL","EMAIL"),
            ("PUSH","PUSH"),
            ("SMS","SMS"),
            ("IN_APP","IN_APP"),
        ]
    )

    enabled = models.BooleanField(default=True)