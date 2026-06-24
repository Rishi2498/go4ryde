from django.urls import path
from notifications.views import *
urlpatterns = [

    path(
        "",
        my_notifications
    ),

    path(
        "notifications/read-all/",
        mark_all_notifications_read
    ),

    path(
        "notifications/<int:notification_id>/read/",
        mark_notification_read
    ),
]