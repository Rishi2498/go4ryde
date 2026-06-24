from rest_framework.throttling import UserRateThrottle


class ChatMessageSendThrottle(UserRateThrottle):
    scope = "chat_send"


class ChatReadThrottle(UserRateThrottle):
    scope = "chat_read"


class ChatMarkReadThrottle(UserRateThrottle):
    scope = "chat_mark_read"