from django.shortcuts import render
from rest_framework.decorators import (
    api_view,
    permission_classes
)
from rest_framework.permissions import (
    IsAuthenticated
)
from rest_framework.response import Response

from notifications .models import Notification

from notifications.serializers import (
    NotificationSerializer
)
from django.db.models import Q


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_notifications(request):

    notifications = (

        Notification.objects
        .filter(user=request.user)
        .order_by("-created_at")
    )

    serializer = NotificationSerializer(

        notifications,

        many=True
    )

    return Response(serializer.data)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):

    updated = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(
        is_read=True
    )

    return Response({
        "success": True,
        "updated_count": updated
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_read(
    request,
    notification_id
):

    try:

        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )

        notification.is_read = True
        notification.save()

        return Response({
            "success": True
        })

    except Notification.DoesNotExist:

        return Response(
            {
                "error": "Notification not found"
            },
            status=404
        )