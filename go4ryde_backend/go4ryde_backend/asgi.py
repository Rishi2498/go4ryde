import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
# ✅ Import AFTER Django setup
from go4ryde_backend.middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns as chat_ws
from tracking.routing import websocket_urlpatterns as tracking_ws
from channels.security.websocket import AllowedHostsOriginValidator

# ✅ Set settings FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'go4ryde_backend.settings')

# ✅ Initialize Django ASGI app (this also setups Django)
django_asgi_app = get_asgi_application()



# ✅ Main ASGI Application
application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": AllowedHostsOriginValidator(
    JWTAuthMiddleware(
        URLRouter([
            *chat_ws,
            *tracking_ws,
        ])
    )
)
})