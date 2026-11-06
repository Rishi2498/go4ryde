
import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "go4ryde_backend.settings",
)

from django.core.asgi import get_asgi_application

# Initialize Django before importing modules that use Django models.
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from go4ryde_backend.middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns as chat_ws
from tracking.routing import websocket_urlpatterns as tracking_ws
from notifications.routing import websocket_urlpatterns as notification_ws

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter([
                *chat_ws,
                *tracking_ws,
                *notification_ws,
            ])
        )
    ),
})
