from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rides.views import *

router = DefaultRouter()
router.register("", RideViewSet, basename="rides")

urlpatterns = [
    # 🔥 CUSTOM ROUTES FIRST
    path("calculate-route/", calculate_route, name="calculate_route"),
    path("accept/<int:booking_id>/", accept_booking),
    path("start/<int:booking_id>/", start_ride),
    path("rides/end/<int:booking_id>/",end_ride),
    
    # 🔥 ROUTER LAST
    path("", include(router.urls)),
]