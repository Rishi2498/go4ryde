from django.db import models
from bookings.models import Booking
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class Payment(models.Model):

    PAYMENT_TYPE_CHOICES = [
        ("FULL", "Online Payment"),
        ("WALLET", "Wallet Payment"),
        ("COD", "Cash On Delivery"),
        ("PARTIAL", "Partial Payment"),

    ]

    STATUS_CHOICES = [
        ("CREATED", "Created"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("PENDING", "Pending"),
        ('Cash', 'Cash'),
    ]

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="payments"
    )

    # 🔥 Razorpay (only for FULL payments)
    razorpay_order_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    razorpay_payment_id = models.CharField(max_length=255, null=True, blank=True)
    razorpay_signature = models.CharField(max_length=255, null=True, blank=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    is_final_payment = models.BooleanField(default=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="CREATED")

    created_at = models.DateTimeField(auto_now_add=True)
    # booking = models.ForeignKey(
    #     Booking,
    #     on_delete=models.CASCADE
    # )
    def __str__(self):
        return f"{self.booking.id} - {self.payment_type} - {self.status}"


class Wallet(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} Wallet - ₹{self.balance}"

class WalletTransaction(models.Model):

    TRANSACTION_TYPE = [
        ("CREDIT", "Credit"),
        ("DEBIT", "Debit"),
    ]

    SOURCE_TYPE = [
        ("PAYMENT", "Payment"),
        ("REFUND", "Refund"),
        ("WITHDRAWAL", "Withdrawal"),
        ("DEPOSIT", "Deposit"),
    ]

    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")

    amount = models.DecimalField(max_digits=12, decimal_places=2)

    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPE)
    source = models.CharField(max_length=20, choices=SOURCE_TYPE)

    reference_id = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet.user.email} - {self.transaction_type} ₹{self.amount}"

# payments/models.py

class BankAccount(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    account_holder_name = models.CharField(max_length=255)

    bank_name = models.CharField(max_length=255)

    account_number = models.CharField(max_length=50)

    ifsc_code = models.CharField(max_length=20)

    upi_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.bank_name}"

class Withdrawal(models.Model):

    STATUS_CHOICES = [
    ("PENDING", "PENDING"),
    ("APPROVED", "APPROVED"),
    ("REJECTED", "REJECTED"),
    ("PAID", "PAID"),
]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    bank_account = models.ForeignKey(
        BankAccount,
        on_delete=models.CASCADE
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )
    razorpay_payout_id = models.CharField(
    max_length=255,
    blank=True,
    null=True
    )

    razorpay_fund_account_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)


class WalletTopUp(models.Model):

    STATUS_CHOICES = [
        ("CREATED", "Created"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="wallet_topups"
    )

    wallet = models.ForeignKey(
        Wallet,
        on_delete=models.CASCADE,
        related_name="topups"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    razorpay_order_id = models.CharField(
        max_length=255,
        unique=True
    )

    razorpay_payment_id = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    razorpay_signature = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="CREATED"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.email} - ₹{self.amount} - {self.status}"