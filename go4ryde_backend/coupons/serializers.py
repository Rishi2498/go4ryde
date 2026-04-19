from rest_framework import serializers
from .models import Coupon


class ApplyCouponSerializer(serializers.Serializer):

    code = serializers.CharField(max_length=20)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    # 🔥 OUTPUT FIELDS (IMPORTANT)
    final_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    # -------------------------
    # 🔍 VALIDATE COUPON
    # -------------------------
    def validate(self, data):

        code = data.get("code").upper().strip()
        amount = data.get("amount")
        user = self.context.get("request").user

        # 🔥 GET COUPON
        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "Invalid coupon code"})

        # 🔥 VALIDATE USING MODEL LOGIC
        is_valid, message = coupon.is_valid(user, amount)

        if not is_valid:
            raise serializers.ValidationError({"coupon": message})

        # 🔥 APPLY DISCOUNT
        final_amount, discount = coupon.apply_discount(amount)

        # 🔥 STORE RESULTS
        data["coupon"] = coupon
        data["final_amount"] = final_amount
        data["discount"] = discount

        return data

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