from django.urls import path
from .views import CreateBookingView, UserBookingsView, BookingDetailView, CancelBookingView

urlpatterns = [
    path('bookings/create/', CreateBookingView.as_view(), name='create-booking'),
    path('bookings/my-bookings/', UserBookingsView.as_view(), name='user-bookings'),
    path('bookings/<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('bookings/<int:pk>/cancel/', CancelBookingView.as_view(), name='cancel-booking'),
]
