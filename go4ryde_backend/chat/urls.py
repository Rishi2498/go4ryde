from django.urls import path

from chat.views import (
    get_messages,
    send_message,
    mark_read,
)

urlpatterns = [

    # 📤 SEND
    path(
        "send/<int:booking_id>/",
        send_message
    ),

    # 👁️ READ
    path(
        "read/<int:booking_id>/",
        mark_read
    ),

    # 📥 GET
    path(
        "<int:booking_id>/",
        get_messages
    ),

]