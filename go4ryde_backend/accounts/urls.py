from django.urls import path
from .views import (
    SendOTPView, VerifyOTPView,
    UserProfileView, DriverProfileCreateView, DriverProfileDetailView,
)

urlpatterns = [
    path('auth/send-otp/', SendOTPView.as_view(), name='send-otp'),
    path('auth/verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('driver/register/', DriverProfileCreateView.as_view(), name='driver-register'),
    path('driver/profile/', DriverProfileDetailView.as_view(), name='driver-profile'),
]