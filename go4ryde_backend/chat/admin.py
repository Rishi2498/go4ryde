from django.contrib import admin
from chat.models import ChatRoom, Message


# =========================
# 💬 MESSAGE INLINE
# =========================
class MessageInline(admin.TabularInline):
    model = Message
    extra = 0

    readonly_fields = (
        "sender",
        "text",
        "is_read",
        "created_at"
    )

    ordering = ("-created_at",)

    can_delete = False


# =========================
# 🏠 CHAT ROOM ADMIN
# =========================
@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "booking",
        "driver",
        "passenger",
        "created_at"
    )

    search_fields = (
        "driver__email",
        "passenger__email",
        "booking__id"
    )

    list_filter = (
        "created_at",
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("-created_at",)

    inlines = [MessageInline]


# =========================
# 📩 MESSAGE ADMIN
# =========================
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "room",
        "sender",
        "short_text",
        "is_read",
        "created_at"
    )

    list_filter = (
        "is_read",
        "created_at"
    )

    search_fields = (
        "sender__email",
        "text"
    )

    readonly_fields = (
        "created_at",
    )

    ordering = ("-created_at",)

    # 🔥 SHORT MESSAGE PREVIEW
    def short_text(self, obj):
        return obj.text[:50]

    short_text.short_description = "Message"