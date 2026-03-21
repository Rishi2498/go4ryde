from django.urls import path
from .views import (
    CreateRideView, SearchRideView, RideDetailView,
    DriverRidesView, ReviewCreateView, RideReviewsView,
)

urlpatterns = [
    path('rides/create/', CreateRideView.as_view(), name='create-ride'),
    path('rides/search/', SearchRideView.as_view(), name='search-ride'),
    path('rides/<int:pk>/', RideDetailView.as_view(), name='ride-detail'),
    path('rides/my-rides/', DriverRidesView.as_view(), name='driver-rides'),
    path('rides/<int:pk>/reviews/', RideReviewsView.as_view(), name='ride-reviews'),
    path('reviews/create/', ReviewCreateView.as_view(), name='create-review'),
]
