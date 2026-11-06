from django.contrib import admin
from .models import *

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "title",
        "notification_type",
        "priority",
        "is_read",
        "created_at",
    )

    list_filter = (
        "notification_type",
        "priority",
        "is_read",
    )

    search_fields = (
        "title",
        "message",
        "user__email",
    )


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):

    list_display = (
        "event",
        "notification_type",
        "priority",
        "is_active",
    )

    list_filter = (
        "notification_type",
        "priority",
        "is_active",
    )

    search_fields = ("event",)


@admin.register(NotificationRule)
class NotificationRuleAdmin(admin.ModelAdmin):

    list_display = (
        "event",
        "receiver_path",
        "is_active",
    )

    search_fields = ("event",)


@admin.register(NotificationAction)
class NotificationActionAdmin(admin.ModelAdmin):

    list_display = (
        "event",
        "action_type",
        "enabled",
    )