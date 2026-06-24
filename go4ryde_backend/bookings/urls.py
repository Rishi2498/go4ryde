from django.urls import path
from bookings.views import *

urlpatterns = [
    path("create/", CreateBookingView.as_view()),

    path(
        "my-bookings/",
        my_bookings
    ),

    path(
        "<int:id>/",
        booking_detail
    ),

    path(
        "cancel/<int:booking_id>/",
        cancel_booking
    ),

    path(
        "accept/<int:booking_id>/",
        accept_booking
    ),

    path(
        "start/<int:booking_id>/",
        start_ride
    ),

    path(
        "end-ride/<int:booking_id>/",
        end_ride
    ),
]