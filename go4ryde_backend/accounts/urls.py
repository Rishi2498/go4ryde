from django.urls import path
from .views import *

urlpatterns = [
    path('send-otp/', SendOTPView.as_view()),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('driver-upgrade/', DriverUpgradeView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('driver-upgrade/', DriverUpgradeView.as_view(), name='driver-upgrade'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),
]