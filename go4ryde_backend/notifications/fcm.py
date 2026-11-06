
import json
import logging
import os

import firebase_admin
from firebase_admin import credentials, messaging
from django.conf import settings

from .models import FCMDeviceToken

logger = logging.getLogger(__name__)


def get_firebase_app():
    if firebase_admin._apps:
        return firebase_admin.get_app()

    credential_path = getattr(
        settings,
        "FIREBASE_SERVICE_ACCOUNT_PATH",
        "",
    ) or os.getenv("GO4RYDE_FIREBASE_CREDENTIALS", "")

    if not credential_path or not os.path.isfile(credential_path):
        logger.error("Firebase service-account credentials are missing")
        return None

    return firebase_admin.initialize_app(
        credentials.Certificate(credential_path)
    )


def send_push_notification(
    user,
    title,
    message,
    metadata=None,
):
    app = get_firebase_app()

    if app is None:
        return

    devices = FCMDeviceToken.objects.filter(user=user)

    for device in devices.iterator():
        try:
            data = {
                str(key): (
                    value
                    if isinstance(value, str)
                    else json.dumps(value)
                )
                for key, value in (metadata or {}).items()
            }

            data["notification_type"] = "GO4RYDE"

            notification_message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=message,
                ),
                data=data,
                token=device.token,
                android=messaging.AndroidConfig(
                    priority="high",
                ),
            )

            messaging.send(notification_message, app=app)

        except messaging.UnregisteredError:
            logger.warning(
                "Removing expired FCM token for user %s",
                user.pk,
            )
            device.delete()

        except Exception:
            logger.exception(
                "FCM delivery failed for user %s",
                user.pk,
            )
