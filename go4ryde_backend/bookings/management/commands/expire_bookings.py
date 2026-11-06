from django.core.management.base import BaseCommand
from django.utils import timezone
from bookings.models import Booking


class Command(BaseCommand):
    help = "Expire pending bookings"

    def handle(self, *args, **kwargs):

        expired = Booking.objects.filter(
            status="PENDING",
            expires_at__lt=timezone.now()
        )

        for booking in expired:
            booking.status = "CANCELLED"
            booking.save()

            print(f"❌ Booking {booking.id} expired")