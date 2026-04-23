from rest_framework import serializers
from coupons.models import Coupon

class ApplyCouponSerializer(serializers.Serializer):

    coupon_code = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate(self, data):

        user = self.context["request"].user

        try:
            coupon = Coupon.objects.get(code=data["coupon_code"])
        except Coupon.DoesNotExist:
            raise serializers.ValidationError("Invalid coupon")

        valid, msg = coupon.is_valid(user, data["amount"])

        if not valid:
            raise serializers.ValidationError(msg)

        final_amount, discount = coupon.apply_discount(data["amount"])

        return {
            "coupon": coupon,
            "discount": discount,
            "final_amount": final_amount
        }

    # -------------------------
    # 🚀 OPTIONAL SAVE METHOD
    # -------------------------
    def save(self, **kwargs):
        """
        Call this ONLY when booking is confirmed
        """
        coupon = self.validated_data["coupon"]
        user = self.context["request"].user

        coupon.mark_used(user)

        return self.validated_data