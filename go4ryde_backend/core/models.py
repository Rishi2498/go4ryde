from django.db import models

class PlatformFee(models.Model):
    percentage = models.FloatField(default=10)

    def save(self, *args, **kwargs):
        if PlatformFee.objects.exists() and not self.pk:
            raise Exception("Only one PlatformFee allowed")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.percentage}%"