from django.db.models.signals import post_save
from django.dispatch import receiver

from bookings.models import Booking

from notifications.dispatcher import NotificationDispatcher

# @receiver(post_save, sender=Booking)
# def booking_status_changed(
#     sender,
#     instance,
#     created,
#     **kwargs
# ):

    # if created:
    #     return
    
    # if instance.status == "CONFIRMED":

    #     NotificationDispatcher.trigger(

    #         "BOOKING_ACCEPTED",

    #         instance,

    #         source=instance.ride.source,

    #         destination=instance.ride.destination
    #     )