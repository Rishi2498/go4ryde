from django.urls import path
from .views import *

urlpatterns = [
    path("create/", CreateBookingView.as_view()),
    path("my-bookings/", my_bookings),                     # GET
    path("cancel/<int:booking_id>/", cancel_booking),      # POST
    path("accept/<int:booking_id>/", accept_booking),
path("start/<int:booking_id>/", start_ride),
]