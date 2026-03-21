from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, phone_number, name, role='passenger', **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not phone_number:
            raise ValueError('The Phone number field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, phone_number=phone_number, name=name, role=role, **extra_fields)
        user.set_unusable_password() 
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        user = self.create_user(email, phone_number, name, role='admin', **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('passenger', 'Passenger'),
        ('driver', 'Driver'),
        ('admin', 'Admin'),
    )
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='passenger')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number', 'name']

    def __str__(self):
        return f"{self.email} - {self.role}"


class DriverProfile(models.Model):
    APPROVAL_STATUS = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )
    VEHICLE_TYPE = (
        ('car', 'Car'),
        ('bike', 'Bike'),
    )
    FUEL_TYPE = (
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
    )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    profile_picture = models.ImageField(upload_to='driver_pics/', null=True, blank=True)
    dl_document = models.FileField(upload_to='driver_docs/dl/')
    rc_document = models.FileField(upload_to='driver_docs/rc/')
    
    vehicle_type = models.CharField(max_length=10, choices=VEHICLE_TYPE)
    vehicle_model_name = models.CharField(max_length=100)
    fuel_type = models.CharField(max_length=10, choices=FUEL_TYPE)
    mileage = models.FloatField(help_text="Mileage in km/l")
    capacity = models.PositiveIntegerField(help_text="Number of seats available")
    
    status = models.CharField(max_length=10, choices=APPROVAL_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Driver {self.user.name} - {self.vehicle_model_name}"


class OTPVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    attempts = models.IntegerField(default=0)
    
    def is_valid(self):
        # 5 minutes expiry and max 3 attempts
        return (timezone.now() - self.created_at).total_seconds() < 300 and self.attempts < 3
