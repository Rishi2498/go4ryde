from django.urls import re_path
from tracking.consumers import RideTrackingConsumer

websocket_urlpatterns = [
    re_path(r'ws/tracking/(?P<ride_id>\d+)/$', RideTrackingConsumer.as_asgi()),
]