from django.db import models
from django.utils import timezone
import random
from django.contrib.auth.models import BaseUserManager, AbstractUser


class CustomUserManager(BaseUserManager):

    def create_user(self, email, phone, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        if not phone:
            raise ValueError("Phone is required")

        email = self.normalize_email(email)

        user = self.model(email=email, phone=phone, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if not phone:
            raise ValueError("Superuser must have phone number")

        return self.create_user(email, phone, password, **extra_fields)

# ---------------- USER MODEL ----------------
class User(AbstractUser):
    ROLE_CHOICES = (
        ('PASSENGER', 'Passenger'),
        ('DRIVER', 'Driver'),
        ('ADMIN', 'Admin'),
    )

    username = models.CharField(max_length=150, unique=False, blank=True, null=True)  # Allow blank usernames
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10, unique=True)

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='PASSENGER')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone']  
    objects = CustomUserManager()  # ✅ ADD THIS

    def __str__(self):
        return self.email


# ---------------- OTP MODEL ----------------
class OTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    attempts = models.IntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.created_at + timezone.timedelta(minutes=5)


# ---------------- PROFILE ----------------
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='profiles/', null=True, blank=True)
    def __str__(self):
        return self.user.email


# ---------------- DRIVER PROFILE ----------------
class DriverProfile(models.Model):

    VERIFICATION_CHOICES = (
        ('PENDING', 'Pending'),
        ('VERIFIED', 'Verified'),
        ('REJECTED', 'Rejected'),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE
    )

    dl_image = models.ImageField(
        upload_to='dl/'
    )

    rc_image = models.ImageField(
        upload_to='rc/'
    )

    profile_image = models.ImageField(
        upload_to='driver_profile/'
    )

    vehicle_number = models.CharField(
        max_length=15
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VERIFICATION_CHOICES,
        default='PENDING'
    )

    rejection_reason = models.TextField(
        blank=True,
        null=True
    )

    verified_at = models.DateTimeField(
        blank=True,
        null=True
    )

    def __str__(self):

        return f"Driver: {self.user.email}"