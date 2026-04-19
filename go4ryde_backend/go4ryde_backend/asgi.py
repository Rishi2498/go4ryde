import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from .middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns as chat_ws
from tracking.routing import websocket_urlpatterns as tracking_ws
 
os.environ.setdefault('DJANGO_SETTINGS_MODULE','go4ryde_backend.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": JWTAuthMiddleware(
        URLRouter([
            *chat_ws,
            *tracking_ws
        ])
    ),
})