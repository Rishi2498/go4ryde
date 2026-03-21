import re
from django import forms
from .models import User, DriverProfile, OTPVerification


ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']


def validate_file_type(f):
    """Validate that uploaded file is PDF or image."""
    import os
    ext = os.path.splitext(f.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise forms.ValidationError(
            f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    if hasattr(f, 'content_type') and f.content_type not in ALLOWED_FILE_TYPES:
        raise forms.ValidationError("File content type not allowed. Upload a PDF or image.")


def validate_phone(value):
    """Phone must be 10–15 digits, optionally starting with +."""
    if not re.match(r'^\+?\d{10,15}$', value):
        raise forms.ValidationError("Enter a valid phone number (10–15 digits).")


# ──────────────────────────────────────────────
# Registration Forms
# ──────────────────────────────────────────────

class PassengerRegistrationForm(forms.ModelForm):
    phone_number = forms.CharField(max_length=15, validators=[validate_phone])

    class Meta:
        model = User
        fields = ['name', 'email', 'phone_number']

    def clean_email(self):
        email = self.cleaned_data['email'].lower().strip()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email


class DriverRegistrationForm(forms.ModelForm):
    """Combined form: creates User + DriverProfile in one step."""
    # User fields
    name = forms.CharField(max_length=255)
    email = forms.EmailField()
    phone_number = forms.CharField(max_length=15, validators=[validate_phone])

    # DriverProfile fields via ModelForm
    class Meta:
        model = DriverProfile
        fields = [
            'profile_picture', 'dl_document', 'rc_document',
            'vehicle_type', 'vehicle_model_name', 'fuel_type',
            'mileage', 'capacity',
        ]

    def clean_email(self):
        email = self.cleaned_data['email'].lower().strip()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("A user with this email already exists.")
        return email

    def clean_phone_number(self):
        phone = self.cleaned_data['phone_number']
        if User.objects.filter(phone_number=phone).exists():
            raise forms.ValidationError("A user with this phone number already exists.")
        return phone

    def clean_dl_document(self):
        f = self.cleaned_data.get('dl_document')
        if f:
            validate_file_type(f)
        return f

    def clean_rc_document(self):
        f = self.cleaned_data.get('rc_document')
        if f:
            validate_file_type(f)
        return f

    def clean_mileage(self):
        val = self.cleaned_data.get('mileage')
        if val is not None and val <= 0:
            raise forms.ValidationError("Mileage must be greater than 0.")
        return val

    def clean_capacity(self):
        val = self.cleaned_data.get('capacity')
        if val is not None and val <= 0:
            raise forms.ValidationError("Capacity must be greater than 0.")
        return val

    def save(self, commit=True):
        # Create the User first
        user = User.objects.create_user(
            email=self.cleaned_data['email'],
            phone_number=self.cleaned_data['phone_number'],
            name=self.cleaned_data['name'],
            role='driver',
        )
        # Then attache the DriverProfile
        profile = super().save(commit=False)
        profile.user = user
        if commit:
            profile.save()
        return profile


# ──────────────────────────────────────────────
# OTP Forms
# ──────────────────────────────────────────────

class SendOTPForm(forms.Form):
    email = forms.EmailField(required=True)

    def clean_email(self):
        return self.cleaned_data['email'].lower().strip()


class VerifyOTPForm(forms.Form):
    email = forms.EmailField(required=True)
    otp = forms.CharField(max_length=6, min_length=6, required=True)

    def clean_email(self):
        return self.cleaned_data['email'].lower().strip()

    def clean_otp(self):
        otp = self.cleaned_data['otp']
        if not otp.isdigit():
            raise forms.ValidationError("OTP must be exactly 6 digits.")
        if len(otp) != 6:
            raise forms.ValidationError("OTP must be exactly 6 digits.")
        return otp
