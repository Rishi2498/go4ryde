from django.urls import path
from .views import update_location, get_driver_location
from django.urls import re_path
from .consumers import RideTrackingConsumer

websocket_urlpatterns = [
    re_path(r'ws/tracking/(?P<ride_id>\d+)/$', RideTrackingConsumer.as_asgi()),
]
urlpatterns = [
    path("update-location/", update_location),  # ✅ MUST match frontend
    path("driver-location/<int:ride_id>/", get_driver_location),  # ✅ FIXED
]