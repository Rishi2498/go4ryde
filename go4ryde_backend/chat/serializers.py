from rest_framework import serializers
from chat.models import ChatRoom, Message

class MessageSerializer(serializers.ModelSerializer):

    sender_email = serializers.EmailField(
        source="sender.email",
        read_only=True
    )

    sender_name = serializers.SerializerMethodField()

    sender_role = serializers.CharField(
        source="sender.role",
        read_only=True
    )

    is_mine = serializers.SerializerMethodField()

    message = serializers.CharField(
        source="text"
    )

    class Meta:
        model = Message
        fields = [
            "id",

            # Message
            "text",
            "message",

            # Sender
            "sender",
            "sender_email",
            "sender_name",
            "sender_role",

            # WhatsApp Style
            "is_mine",

            # Meta
            "is_read",
            "created_at",
        ]

    # -------------------------
    # 👤 SENDER NAME
    # -------------------------
    def get_sender_name(self, obj):

        if obj.sender.first_name:
            return obj.sender.first_name

        return obj.sender.email.split("@")[0]

    # -------------------------
    # ✅ IS MY MESSAGE?
    # -------------------------
    def get_is_mine(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        return obj.sender_id == request.user.id

class ChatRoomSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "ride",
            "driver",
            "passenger",
            "is_active",
            "created_at",
            "last_message",
        ]

    def get_last_message(self, obj):
        last = obj.messages.order_by("-created_at").first()
        if last:
            return MessageSerializer(last).data
        return None