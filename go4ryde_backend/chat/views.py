# from email import message

from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from notifications.dispatcher import NotificationDispatcher

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.utils import timezone

from datetime import timedelta

from bookings.models import Booking

from chat.models import ChatRoom, Message
from chat.serializers import MessageSerializer
from chat.throttles import *

from chat.utils import can_access_chat


# =========================================
# 📥 GET MESSAGES
# =========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([ChatReadThrottle])
def get_messages(request, booking_id):

    booking = get_object_or_404(
        Booking,
        id=booking_id
    )

    room = ChatRoom.objects.filter(
        booking=booking
    ).first()

    if not room:
        if booking.status in ["CONFIRMED", "STARTED", "ACTIVE"]:
            room, _ = ChatRoom.objects.get_or_create(
                booking=booking,
                defaults={
                    "driver": booking.ride.driver,
                    "passenger": booking.user,
                }
            )
        else:
            return Response(
                {"error": "Room not found"},
                status=404
            )

    # 🔐 ACCESS CHECK
    if not can_access_chat(request.user, room):
        return Response(
            {"error": "Unauthorized"},
            status=403
        )

    messages = room.messages.select_related(
        "sender"
    ).order_by("created_at")

    serializer = MessageSerializer(
        messages,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data)


# =========================================
# 👁️ MARK READ
# =========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ChatMarkReadThrottle])
def mark_read(request, booking_id):

    booking = get_object_or_404(
        Booking,
        id=booking_id
    )

    room = ChatRoom.objects.filter(
        booking=booking
    ).first()

    if not room:
        if booking.status in ["CONFIRMED", "STARTED", "ACTIVE"]:
            room, _ = ChatRoom.objects.get_or_create(
                booking=booking,
                defaults={
                    "driver": booking.ride.driver,
                    "passenger": booking.user,
                }
            )
        else:
            return Response(
                {"error": "Room not found"},
                status=404
            )

    # 🔐 ACCESS CHECK
    if not can_access_chat(request.user, room):
        return Response(
            {"error": "Unauthorized"},
            status=403
        )

    Message.objects.filter(
        room=room,
        is_read=False
    ).exclude(
        sender=request.user
    ).update(
        is_read=True
    )

    return Response({
        "message": "read"
    })


# =========================================
# 📤 SEND MESSAGE
# =========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ChatMessageSendThrottle])
def send_message(request, booking_id):

    booking = get_object_or_404(
        Booking,
        id=booking_id
    )

    room = ChatRoom.objects.filter(
        booking=booking
    ).first()

    if not room:
        if booking.status in ["CONFIRMED", "STARTED", "ACTIVE"]:
            room, _ = ChatRoom.objects.get_or_create(
                booking=booking,
                defaults={
                    "driver": booking.ride.driver,
                    "passenger": booking.user,
                }
            )
        else:
            return Response(
                {"error": "Room not found"},
                status=404
            )

    # =========================================
    # 🔐 ACCESS CHECK
    # =========================================
    if not can_access_chat(request.user, room):
        return Response(
            {"error": "Unauthorized"},
            status=403
        )

    # =========================================
    # 📝 MESSAGE TEXT
    # =========================================
    text = request.data.get(
        "message",
        ""
    ).strip()

    # ❌ EMPTY
    if not text:
        return Response(
            {"error": "Empty message"},
            status=400
        )

    # ❌ TOO LONG
    if len(text) > 500:
        return Response(
            {"error": "Too long"},
            status=400
        )

    # ❌ SPAM
    if any(
        word in text.lower()
        for word in ["spam", "abuse"]
    ):
        return Response(
            {"error": "Blocked"},
            status=400
        )

    # =========================================
    # 🔥 RATE LIMIT
    # =========================================
    cache_key = f"chat_{request.user.id}"

    if cache.get(cache_key):
        return Response(
            {"error": "Too fast"},
            status=429
        )

    cache.set(
        cache_key,
        True,
        timeout=1
    )

    # =========================================
    # 🔥 DUPLICATE BLOCK
    # =========================================
    last_msg = (
        Message.objects
        .filter(
            room=room,
            sender=request.user,
            text=text
        )
        .order_by("-created_at")
        .first()
    )

    if (
        last_msg
        and (
            timezone.now()
            - last_msg.created_at
        ) < timedelta(seconds=5)
    ):
        return Response(
            {"error": "Duplicate"},
            status=429
        )

    # =========================================
    # ✅ CREATE MESSAGE
    # =========================================
    message = Message.objects.create(
        room=room,
        sender=request.user,
        text=text
    )

    serializer = MessageSerializer(
        message,
        context={"request": request}
    )

    print("=========================================")
    print("💬 CHAT MESSAGE SAVED:", message.id)
    print("👤 CHAT SENDER:", message.sender_id)
    print("🚗 CHAT DRIVER:", message.room.driver_id)
    print("🧑 CHAT PASSENGER:", message.room.passenger_id)

    # =========================================
    # 🔔 CHAT NOTIFICATION
    # =========================================
    try:

        print("🔥 CHAT NOTIFICATION TRIGGER")

        notification = (
            NotificationDispatcher
            .trigger_chat_message(message)
        )

        print(
            "🔥 CHAT NOTIFICATION RESULT:",
            notification
        )

    except Exception as notification_error:

        # Notification failure should NOT
        # prevent the chat message from
        # being successfully sent.
        print(
            "❌ CHAT NOTIFICATION ERROR:",
            str(notification_error)
        )

    print("=========================================")

    # =========================================
    # 📤 RESPONSE
    # =========================================
    return Response({

        "id": message.id,

        "message": message.text,

        "sender": request.user.email,

        "timestamp": message.created_at,

        "status": "sent",

        "serializer": serializer.data

    })