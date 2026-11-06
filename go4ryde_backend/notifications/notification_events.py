NOTIFICATION_EVENTS = {

    # ============================================================
    # BOOKING
    # ============================================================

    "BOOKING_CREATED": {
        "title": "New Booking Request",
        "message": "{passenger_name} requested {seats} seat(s) for your ride from {source} to {destination}.",
        "notification_type": "BOOKING",
        "priority": "HIGH",
        "receivers": ["ride.driver"],
    },

    "BOOKING_ACCEPTED": {
        "title": "Booking Accepted",
        "message": "Your booking from {source} to {destination} has been accepted by the driver.",
        "notification_type": "BOOKING",
        "priority": "HIGH",
        "receivers": ["user"],
    },

    "BOOKING_REJECTED": {
        "title": "Booking Cancelled",
        "message": "Your booking from {source} to {destination} has been cancelled.",
        "notification_type": "BOOKING",
        "priority": "HIGH",
        "receivers": ["user"],
    },


    # ============================================================
    # RIDE
    # ============================================================

    "RIDE_STARTED": {
        "title": "Ride Started",
        "message": "Your ride from {source} to {destination} has started.",
        "notification_type": "RIDE",
        "priority": "HIGH",
        "receivers": ["user"],
    },

    "RIDE_COMPLETED": {
        "title": "Ride Completed",
        "message": "Your ride from {source} to {destination} has been completed.",
        "notification_type": "RIDE",
        "priority": "MEDIUM",
        "receivers": ["user"],
    },


    # ============================================================
    # PAYMENT
    # ============================================================

    "PAYMENT_SUCCESS": {
        "title": "Payment Successful",
        "message": "Your payment of ₹{amount} for booking #{booking_id} was successful.",
        "notification_type": "PAYMENT",
        "priority": "HIGH",
        "receivers": ["booking.user"],
    },

    "PAYMENT_FAILED": {
        "title": "Payment Failed",
        "message": "Your payment for booking #{booking_id} could not be completed.",
        "notification_type": "PAYMENT",
        "priority": "HIGH",
        "receivers": ["booking.user"],
    },

    "PAYMENT_CASH_SELECTED": {
        "title": "Cash Payment Selected",
        "message": "Cash payment has been selected for booking #{booking_id}.",
        "notification_type": "PAYMENT",
        "priority": "MEDIUM",
        "receivers": ["booking.user"],
    },


    # ============================================================
    # WALLET
    # ============================================================

    "WALLET_TOPUP_SUCCESS": {
        "title": "Wallet Top-Up Successful",
        "message": "₹{amount} has been added to your wallet.",
        "notification_type": "WALLET",
        "priority": "HIGH",
        "receivers": ["user"],
    },

    "WALLET_WITHDRAW": {
        "title": "Withdrawal Requested",
        "message": "Your withdrawal request of ₹{amount} has been submitted successfully.",
        "notification_type": "WITHDRAWAL",
        "priority": "HIGH",
        "receivers": ["user"],
    },

    "WALLET_WITHDRAW_APPROVED": {
        "title": "Withdrawal Approved",
        "message": "Your withdrawal of ₹{amount} has been approved.",
        "notification_type": "WITHDRAWAL",
        "priority": "HIGH",
        "receivers": ["user"],
    },

    "WALLET_WITHDRAW_REJECTED": {
        "title": "Withdrawal Rejected",
        "message": "Your withdrawal of ₹{amount} has been rejected.",
        "notification_type": "WITHDRAWAL",
        "priority": "HIGH",
        "receivers": ["user"],
    },


    # ============================================================
    # CHAT
    # ============================================================

    "NEW_CHAT_MESSAGE": {
        "title": "New Message",
        "message": "{sender_name} sent you a message.",
        "notification_type": "CHAT",
        "priority": "MEDIUM",
        "receivers": ["chat_other_participant"],
    },
}   