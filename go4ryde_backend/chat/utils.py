# chat/utils.py

def can_chat(user, ride, booking=None,):
    if not user or not ride:
        return False, "Invalid user or ride"

    # ❌ Ride ended
    if ride.status in ["CANCELLED", "COMPLETED"]:
        return False, "Ride ended"

    # ✅ Driver
    if ride.driver_id == user.id:
        return True, "Driver allowed"

    # ❌ Passenger must have accepted booking
    if not booking:
        return False, "No booking"

    if booking.status != "ACCEPTED":
        return False, "Booking not accepted"

    if booking.user_id != user.id:
        return False, "Unauthorized"

    return True, "Passenger allowed"

def can_access_chat(user, room):

    return (
        user == room.driver
        or
        user == room.passenger
    )