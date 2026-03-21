from django.urls import path
from .views import NotificationListView, MarkNotificationReadView, MarkAllReadView

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('notifications/read-all/', MarkAllReadView.as_view(), name='mark-all-read'),
]
