from django.urls import path

from accounts.views import *


urlpatterns = [

    path(
        'send-otp/',
        SendOTPView.as_view(),
        name='send-otp'
    ),

    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),

    path(
        'driver-upgrade/',
        DriverUpgradeView.as_view(),
        name='driver-upgrade'
    ),

    path(
        'logout/',
        LogoutView.as_view(),
        name='logout'
    ),

    path(
        'profile/',
        ProfileView.as_view(),
        name='profile'
    ),

    path(
        'profile/update/',
        ProfileUpdateView.as_view(),
        name='profile-update'
    ),

]