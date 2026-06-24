from django.db import models
from bookings.models import Booking
from django.conf import settings
class PlatformFee(models.Model):
    percentage = models.FloatField(default=10)
    partial_payment_percentage = models.DecimalField(
    max_digits=5,
    decimal_places=2,
    default=15
)
    def save(self, *args, **kwargs):
        if PlatformFee.objects.exists() and not self.pk:
            raise Exception("Only one PlatformFee allowed")
        super().save(*args, **kwargs)



# class Notification(models.Model):

#     NOTIFICATION_TYPES = [
#         ("BOOKING", "BOOKING"),
#         ("PAYMENT", "PAYMENT"),
#         ("WALLET", "WALLET"),
#         ("WITHDRAWAL", "WITHDRAWAL"),
#         ("CHAT", "CHAT"),
#         ("RIDE", "RIDE"),
#         ("SYSTEM", "SYSTEM"),
#     ]

#     PRIORITY_LEVELS = [
#         ("LOW", "LOW"),
#         ("MEDIUM", "MEDIUM"),
#         ("HIGH", "HIGH"),
#     ]

#     user = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         on_delete=models.CASCADE,
#         related_name="notifications",
#         db_index=True
#     )

#     title = models.CharField(max_length=255)

#     message = models.TextField()

#     notification_type = models.CharField(
#         max_length=30,
#         choices=NOTIFICATION_TYPES,
#         db_index=True
#     )

#     priority = models.CharField(
#         max_length=20,
#         choices=PRIORITY_LEVELS,
#         default="MEDIUM"
#     )

#     is_read = models.BooleanField(
#         default=False,
#         db_index=True
#     )

#     metadata = models.JSONField(
#         blank=True,
#         null=True
#     )

#     created_at = models.DateTimeField(
#         auto_now_add=True,
#         db_index=True
#     )

#     class Meta:
#         ordering = ["-created_at"]

#     def __str__(self):
#         return f"{self.user.email} - {self.title}"