from django.urls import path
from chat.views import get_chat_messages, mark_messages_read, send_message_api

app_name = "chat"

urlpatterns = [
    path("<int:ride_id>/messages/", get_chat_messages, name="get_messages"),
    path("<int:ride_id>/read/", mark_messages_read, name="mark_read"),
    path("<int:ride_id>/send/", send_message_api, name="send_message"),
]