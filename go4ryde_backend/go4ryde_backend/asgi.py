import os
import django

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

# ✅ Set settings FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'go4ryde_backend.settings')

# ✅ Initialize Django
django.setup()

# ✅ Now import after setup
from .middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns as chat_ws
from tracking.routing import websocket_urlpatterns as tracking_ws

# ✅ HTTP app
django_asgi_app = get_asgi_application()

# ✅ Main application
application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": JWTAuthMiddleware(
        URLRouter([
            *chat_ws,
            *tracking_ws
        ])
    ),
})