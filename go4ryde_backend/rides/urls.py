from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RideViewSet,
    calculate_route,
    accept_booking,
    start_ride
)

router = DefaultRouter()
router.register("", RideViewSet, basename="rides")

urlpatterns = [
    path("", include(router.urls)),

    # 📍 ROUTE PREVIEW
    path("calculate-route/", calculate_route),

    # 🚗 BOOKING ACTIONS
    path("accept/<int:booking_id>/", accept_booking),
    path("start/<int:booking_id>/", start_ride),
]