from django.db import models
from accounts.models import User
from rides.models import Ride

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    ride = models.ForeignKey(Ride, on_delete=models.CASCADE, related_name='bookings')
    passenger = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    seats = models.PositiveIntegerField(default=1)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.passenger.name} booking for {self.ride}"

class BookingCancellation(models.Model):
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    reason = models.TextField(blank=True)
    penalty_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cancelled_at = models.DateTimeField(auto_now_add=True)
