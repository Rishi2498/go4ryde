import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import tracking.routing  # We will create this later

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'go4ryde_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            tracking.routing.websocket_urlpatterns
        )
    ),
})
