from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver

from bookings.models import Booking
from notifications.dispatcher import NotificationDispatcher


@receiver(pre_save, sender=Booking)
def remember_previous_booking_status(sender, instance, **kwargs):
    if not instance.pk:
        instance._previous_status = None
        return

    instance._previous_status = (
        sender.objects.filter(pk=instance.pk)
        .values_list("status", flat=True)
        .first()
    )


@receiver(post_save, sender=Booking)
def booking_status_changed(sender, instance, created, **kwargs):
    if created:
        return

    previous_status = getattr(instance, "_previous_status", None)

    if (
        previous_status != "ACCEPTED"
        and instance.status == "ACCEPTED"
    ):
        NotificationDispatcher.trigger(
            "BOOKING_ACCEPTED",
            instance,
            source=instance.ride.source,
            destination=instance.ride.destination,
            metadata={
                "booking_id": instance.id,
                "ride_id": instance.ride_id,
                "status": instance.status,
            },
        )