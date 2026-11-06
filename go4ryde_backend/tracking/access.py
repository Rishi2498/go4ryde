
from rides.models import Ride
from bookings.models import Booking


def can_access_ride(user, ride_id):
    if not user or not user.is_authenticated:
        return False

    ride = Ride.objects.filter(id=ride_id).first()

    if ride is None:
        return False

    # The driver can access their own ride.
    if ride.driver_id == user.id:
        return True

    # Passengers must have an eligible booking.
    return Booking.objects.filter(
        ride_id=ride_id,
        user_id=user.id,
        status__in=["CONFIRMED", "ACCEPTED", "STARTED", "COMPLETED"],
    ).exists()
