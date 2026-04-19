from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class Ride(models.Model):
    STATUS_CHOICES = (
        ('CREATED', 'Created'),     # 🔥 NEW
        ('STARTED', 'Started'),     # 🔥 NEW
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="rides")

    # 📍 Location Info
    source = models.CharField(max_length=500)
    source_lat = models.FloatField()
    source_lng = models.FloatField()

    destination = models.CharField(max_length=500)
    destination_lat = models.FloatField()
    destination_lng = models.FloatField()

    # 📏 Route Info
    distance_km = models.FloatField(null=True, blank=True)
    duration_min = models.FloatField(null=True, blank=True)
    route_geometry = models.JSONField(null=True, blank=True)

    # ⏰ Ride Timing
    date_time = models.DateTimeField()

    # 💰 Pricing
    price_per_seat = models.DecimalField(max_digits=7, decimal_places=2)

    # 🪑 Seats
    seats_available = models.PositiveIntegerField()
    seats_booked = models.PositiveIntegerField(default=0)

    # 🚦 Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='CREATED'   # 🔥 IMPORTANT CHANGE
    )

    # 🕒 Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # -------------------------
    # 🔥 BUSINESS LOGIC
    # -------------------------

    def seats_remaining(self):
        return self.seats_available - self.seats_booked

    def is_full(self):
        return self.seats_booked >= self.seats_available

    def can_book(self, seats=1):
        return self.seats_remaining() >= seats and self.status == 'CREATED'

    def book_seat(self, seats=1):
        if not self.can_book(seats):
            raise ValueError("Not enough seats available or ride not active")

        self.seats_booked += seats
        self.save()

    def start_ride(self):   # 🔥 NEW METHOD
        self.status = "STARTED"
        self.save()

    def complete_ride(self):
        self.status = 'COMPLETED'
        self.save()

    def cancel_ride(self):
        self.status = 'CANCELLED'
        self.save()

    def __str__(self):
        return f"{self.source} → {self.destination} ({self.date_time})"


class DriverLocation(models.Model):
    ride = models.ForeignKey(Ride, on_delete=models.CASCADE)
    lat = models.FloatField()
    lng = models.FloatField()
    updated_at = models.DateTimeField(auto_now=True)