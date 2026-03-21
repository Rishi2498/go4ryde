from django.db import models
from accounts.models import User
from bookings.models import Booking

class Payment(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    razorpay_order_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.id} for Booking {self.booking.id}"

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
class WalletTransaction(models.Model):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=20, choices=(('credit', 'Credit'), ('debit', 'Debit')))
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
