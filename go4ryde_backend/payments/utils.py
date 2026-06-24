from core.models import PlatformFee
from decimal import Decimal


def calculate_amount(booking, payment_type):

    platform_fee = PlatformFee.objects.first()

    if not platform_fee:
        raise Exception("Platform fee not configured")

    if payment_type == "FULL":
        return booking.final_amount, True

    elif payment_type == "PARTIAL":
        fee = (booking.final_amount * Decimal(platform_fee.percentage)) / 100
        return fee, False

    elif payment_type == "REMAINING":
        return booking.remaining_amount, True

    else:
        raise Exception("Invalid payment type")


def update_booking_after_payment(payment):

    booking = payment.booking

    # 🔥 Deduct paid amount
    booking.remaining_amount = booking.remaining_amount - payment.amount

    # 🛡️ Safety check
    if booking.remaining_amount < 0:
        booking.remaining_amount = Decimal("0.00")

    # 🔥 Final payment check
    if payment.is_final_payment or booking.remaining_amount == 0:
        booking.payment_status = "PAID"
        booking.status = "CONFIRMED"
    else:
        booking.payment_status = "PARTIALLY_PAID"
        booking.status = "PENDING"

    booking.save()


def partial_payment_percentage(booking):

    fee = PlatformFee.objects.first()

    percentage = (
        fee.percentage
        if fee
        else Decimal("10")
    )

    upfront = (
        booking.final_amount
        * percentage
        / Decimal("100")
    )

    remaining = (
        booking.final_amount
        - upfront
    )

    return {
        "upfront": upfront.quantize(
            Decimal("0.01")
        ),
        "remaining": remaining.quantize(
            Decimal("0.01")
        )
    }