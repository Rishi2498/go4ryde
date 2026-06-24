# bookings/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from bookings.models import Booking
from chat.models import ChatRoom


@receiver(post_save, sender=Booking)
def create_chat_room(sender, instance, created, **kwargs):

    if instance.status == "CONFIRMED":
        ChatRoom.objects.get_or_create(
            booking=instance,
            driver=instance.ride.driver,
            passenger=instance.user
        )