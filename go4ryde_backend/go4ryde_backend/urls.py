from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('jet/', include('jet.urls', 'jet')),  # Django JET URLS
    path('jet/dashboard/', include('jet.dashboard.urls', 'jet-dashboard')),  # Django JET dashboard URLS
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/rides/', include('rides.urls')),
    path('api/bookings/', include('bookings.urls')),
    path("api/payments/", include(("payments.urls", "payments"), namespace="payments")),
    path("api/coupons/", include(("coupons.urls", "coupons"), namespace="coupons")),
    path("api/chat/", include(("chat.urls", "chat"), namespace="chat")),
    path("api/tracking/", include(("tracking.urls", "tracking"), namespace="tracking")),
    path('api/core/', include('core.urls')),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
