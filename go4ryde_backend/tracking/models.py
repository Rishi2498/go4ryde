from django.db import models
from rides.models import Ride
from django.conf import settings


class DriverLocation(models.Model):
    """
    Stores ONLY the latest location of a driver for a ride
    (fast read for real-time tracking)
    """

    ride = models.OneToOneField(
        Ride,
        on_delete=models.CASCADE,
        related_name="current_location"
    )

    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="active_locations"
    )

    lat = models.FloatField()
    lng = models.FloatField()

    heading = models.FloatField(null=True, blank=True)  # direction in degrees
    speed = models.FloatField(null=True, blank=True)    # km/h (optional)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "driver_live_location"   # 🔥 cleaner DB naming
        indexes = [
            models.Index(fields=["ride"]),
            models.Index(fields=["driver"]),
            models.Index(fields=["updated_at"]),  # 🔥 useful for live queries
        ]

    def __str__(self):
        return f"Ride {self.ride.id} → ({self.lat}, {self.lng})"


class DriverLocationHistory(models.Model):
    """
    Stores full tracking history (for replay, analytics, route drawing)
    """

    ride = models.ForeignKey(
        Ride,
        on_delete=models.CASCADE,
        related_name="location_history"
    )

    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="location_history"
    )

    lat = models.FloatField()
    lng = models.FloatField()

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "driver_location_history"
        ordering = ["-timestamp"]  # 🔥 latest first
        indexes = [
            models.Index(fields=["ride", "timestamp"]),
            models.Index(fields=["driver"]),
        ]

    def __str__(self):
        return f"Ride {self.ride.id} @ {self.timestamp}"