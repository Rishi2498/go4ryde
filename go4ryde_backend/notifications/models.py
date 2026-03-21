from django.db import models
from accounts.models import User


class Notification(models.Model):
    TYPE_CHOICES = (
        ('booking', 'Booking'),
        ('payment', 'Payment'),
        ('ride', 'Ride'),
        ('system', 'System'),
        ('sos', 'SOS'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.name}"
