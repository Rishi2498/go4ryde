from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from notifications.models import Notification

from .models import FCMDeviceToken


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_fcm_token(request):
    token = request.data.get("token")

    if not isinstance(token, str) or not token.strip():
        return Response(
            {"error": "A valid FCM token is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token = token.strip()

    FCMDeviceToken.objects.update_or_create(
        token=token,
        defaults={"user": request.user},
    )

    return Response(
        {"message": "FCM token registered successfully."},
        status=status.HTTP_200_OK,
    )




# =========================================
# 🔔 GET MY NOTIFICATIONS
# =========================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications(request):

    notifications = (
        Notification.objects
        .filter(user=request.user)
        .order_by("-created_at")
    )

    unread_count = notifications.filter(
        is_read=False
    ).count()

    data = []

    for notification in notifications:

        data.append({
            "id": notification.id,
            "title": notification.title,
            "message": notification.message,
            "notification_type": notification.notification_type,
            "priority": notification.priority,
            "is_read": notification.is_read,
            "metadata": notification.metadata or {},
            "created_at": notification.created_at,
        })

    return Response({
        "notifications": data,
        "unread_count": unread_count,
        "total_count": notifications.count(),
    })


# =========================================
# 👁️ MARK ONE AS READ
# =========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):

    notification = Notification.objects.filter(
        id=notification_id,
        user=request.user
    ).first()

    if not notification:
        return Response(
            {
                "error": "Notification not found"
            },
            status=404
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return Response({
        "success": True,
        "message": "Notification marked as read",
        "notification_id": notification.id,
    })


# =========================================
# 👁️ MARK ALL AS READ
# =========================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):

    updated = (
        Notification.objects
        .filter(
            user=request.user,
            is_read=False
        )
        .update(is_read=True)
    )

    return Response({
        "success": True,
        "message": "All notifications marked as read",
        "updated_count": updated,
    })