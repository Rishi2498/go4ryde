from django.urls import path
from tracking.consumers import TrackingConsumer

websocket_urlpatterns = [
    path('ws/tracking/<int:ride_id>/', TrackingConsumer.as_asgi()),
]
