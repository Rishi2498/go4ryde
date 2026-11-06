from django.urls import path

from notifications.views import (
    my_notifications,
    mark_notification_read,
    mark_all_notifications_read,
    register_fcm_token
)


urlpatterns = [

    # 🔔 Notifications
    path(
        "",
        my_notifications,
        name="my-notifications"
    ),

    # 👁️ Mark one read
    path(
        "<int:notification_id>/read/",
        mark_notification_read,
        name="mark-notification-read"
    ),

    # 👁️ Mark all read
    path(
        "read-all/",
        mark_all_notifications_read,
        name="mark-all-notifications-read"
    ),

    path(
    "fcm-token/",
    register_fcm_token,
    name="register-fcm-token",
    ),
    
]