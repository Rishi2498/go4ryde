from django.db import models
from accounts.models import DriverProfile
import json


class Ride(models.Model):
    RIDE_TYPE_CHOICES = (
        ('local', 'Local'),
        ('intercity', 'Intercity'),
    )

    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='rides')
    ride_type = models.CharField(max_length=10, choices=RIDE_TYPE_CHOICES, default='local')
    source_name = models.CharField(max_length=255)
    destination_name = models.CharField(max_length=255)

    source_lat = models.FloatField()
    source_lng = models.FloatField()
    dest_lat = models.FloatField()
    dest_lng = models.FloatField()

    stops = models.JSONField(default=list, blank=True, help_text='List of stops: [{"name": "...", "lat": ..., "lng": ...}]')
    route_polyline = models.TextField(blank=True, default='')

    departure_time = models.DateTimeField()
    available_seats = models.PositiveIntegerField()
    total_seats = models.PositiveIntegerField()
    women_only = models.BooleanField(default=False)
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.source_name} to {self.destination_name} by {self.driver.user.name}"


class Review(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey('accounts.User', on_delete=models.CASCADE, related_name='given_reviews')
    driver = models.ForeignKey(DriverProfile, on_delete=models.CASCADE, related_name='received_reviews')
    rating = models.PositiveIntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('ride', 'reviewer')

    def __str__(self):
        return f"Review by {self.reviewer.name} for {self.driver.user.name}"
