from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from rides.models import *
from .models import ChatRoom, Message
from .serializers import MessageSerializer
from .utils import can_chat

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, ride_id):

    ride = get_object_or_404(Ride, id=ride_id)

    booking = Booking.objects.filter(
        ride=ride, user=request.user
    ).first()

    allowed, msg = can_chat(request.user, ride, booking)

    if not allowed:
        return Response({"error": msg}, status=403)

    room = ChatRoom.objects.filter(ride=ride).first()

    if not room:
        return Response([])

    messages = room.messages.select_related("sender").order_by("-created_at")[:50]

    return Response(MessageSerializer(messages, many=True).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, ride_id):

    ride = get_object_or_404(Ride, id=ride_id)

    booking = Booking.objects.filter(
        ride=ride, user=request.user
    ).first()

    allowed, msg = can_chat(request.user, ride, booking)

    if not allowed:
        return Response({"error": msg}, status=403)

    room = ChatRoom.objects.filter(ride=ride).first()

    if not room:
        return Response({"message": "No chat found"})

    Message.objects.filter(
        room=room,
        is_read=False
    ).exclude(sender=request.user).update(is_read=True)

    return Response({"message": "Messages marked as read"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message_api(request, ride_id):

    ride = get_object_or_404(Ride, id=ride_id)

    booking = Booking.objects.filter(
        ride=ride, user=request.user
    ).first()

    allowed, msg = can_chat(request.user, ride, booking)

    if not allowed:
        return Response({"error": msg}, status=403)

    text = request.data.get("message", "").strip()

    if not text:
        return Response({"error": "Empty message"}, status=400)

    if len(text) > 500:
        return Response({"error": "Message too long"}, status=400)

    # 🚫 Basic abuse filter
    blocked_words = ["spam", "abuse"]
    if any(word in text.lower() for word in blocked_words):
        return Response({"error": "Message blocked"}, status=400)

    # 🚫 Phone restriction (before ride start)
    import re
    if ride.status != "STARTED" and re.search(r"\b\d{10}\b", text):
        return Response({"error": "Phone sharing not allowed yet"}, status=400)

    # ✅ Get or create room
    room, _ = ChatRoom.objects.get_or_create(
        ride=ride,
        driver=ride.driver,
        passenger=booking.user if booking else None
    )

    message = Message.objects.create(
        room=room,
        sender=request.user,
        text=text
    )

    return Response({
        "id": message.id,
        "message": message.text,
        "sender": request.user.email,
        "timestamp": message.created_at
    })