from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from rides.models import Ride
from chat.models import ChatRoom, Message
from chat.serializers import MessageSerializer

import re


# -------------------------
# 📥 GET CHAT MESSAGES
# -------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_chat_messages(request, ride_id):

    ride = get_object_or_404(Ride, id=ride_id)

    room = ChatRoom.objects.filter(ride=ride).first()

    if not room:
        return Response([])

    # ✅ NEW PERMISSION CHECK
    if not room.participants.filter(id=request.user.id).exists():
        return Response({"error": "Not allowed to chat"}, status=403)

    messages = room.messages.select_related("sender")\
        .order_by("-created_at")[:50]

    return Response(MessageSerializer(messages, many=True).data)


# -------------------------
# 👁️ MARK READ
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, ride_id):

    ride = get_object_or_404(Ride, id=ride_id)

    room = ChatRoom.objects.filter(ride=ride).first()

    if not room:
        return Response({"message": "No chat found"})

    # ✅ NEW PERMISSION CHECK
    if not room.participants.filter(id=request.user.id).exists():
        return Response({"error": "Not allowed"}, status=403)

    Message.objects.filter(
        room=room,
        is_read=False
    ).exclude(sender=request.user).update(is_read=True)

    return Response({"message": "Messages marked as read"})


# -------------------------
# 📤 SEND MESSAGE (API fallback)
# -------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message_api(request, ride_id):

    ride = get_object_or_404(Ride, id=ride_id)

    room = ChatRoom.objects.filter(ride=ride).first()

    if not room:
        return Response({"error": "Chat room not found"}, status=404)

    # ✅ NEW PERMISSION CHECK
    if not room.participants.filter(id=request.user.id).exists():
        return Response({"error": "Not allowed"}, status=403)

    text = request.data.get("message", "").strip()

    # ❌ VALIDATION
    if not text:
        return Response({"error": "Empty message"}, status=400)

    if len(text) > 500:
        return Response({"error": "Message too long"}, status=400)

    # 🚫 Abuse filter
    if any(word in text.lower() for word in ["spam", "abuse"]):
        return Response({"error": "Message blocked"}, status=400)

    # 🚫 Phone restriction (before ride start)
    if ride.status != "ACTIVE" and re.search(r"\b\d{10}\b", text):
        return Response({"error": "Phone sharing not allowed yet"}, status=400)

    # ✅ CREATE MESSAGE
    message = Message.objects.create(
        room=room,
        sender=request.user,
        text=text
    )

    return Response({
        "id": message.id,
        "message": message.text,
        "sender": request.user.email,
        "timestamp": message.created_at,
        "status": "sent"
    })