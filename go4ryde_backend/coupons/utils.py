from decimal import Decimal

# -------------------------
# 🔍 VALIDATE COUPON
# -------------------------
def validate_coupon(coupon, user, amount):
    """
    Wrapper for model validation
    """

    is_valid, message = coupon.is_valid(user, amount)

    return is_valid, message


# -------------------------
# 💰 APPLY DISCOUNT
# -------------------------
def apply_coupon_discount(coupon, amount):
    """
    Wrapper for model discount logic
    """

    final_amount, discount = coupon.apply_discount(amount)

    return discount, final_amount


# -------------------------
# 📊 MARK USED
# -------------------------
def mark_coupon_used(coupon, user):
    """
    Wrapper for usage tracking
    """

    coupon.mark_used(user)