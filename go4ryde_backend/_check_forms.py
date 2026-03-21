import django, os
os.environ['DJANGO_SETTINGS_MODULE'] = 'go4ryde_backend.settings'
django.setup()
from accounts.forms import PassengerRegistrationForm, DriverRegistrationForm, SendOTPForm, VerifyOTPForm
from rides.forms import CreateRideForm, SearchRideForm
from bookings.forms import BookingForm, PaymentForm
print("All 8 forms imported successfully")
print(f"  accounts: PassengerRegistrationForm, DriverRegistrationForm, SendOTPForm, VerifyOTPForm")
print(f"  rides:    CreateRideForm, SearchRideForm")
print(f"  bookings: BookingForm, PaymentForm")
