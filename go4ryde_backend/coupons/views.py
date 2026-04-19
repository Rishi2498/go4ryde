from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import ApplyCouponSerializer


# -------------------------
# 🎯 APPLY COUPON
# -------------------------
class ApplyCouponView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ApplyCouponSerializer(
            data=request.data,
            context={"request": request}  # 🔥 IMPORTANT
        )

        serializer.is_valid(raise_exception=True)

        return Response({
            "coupon": serializer.validated_data["coupon"].code,
            "discount": serializer.validated_data["discount"],
            "final_amount": serializer.validated_data["final_amount"]
        })


# -------------------------
# 🏠 TEST ENDPOINT
# -------------------------
class CouponHomeView(APIView):

    def get(self, request):
        return Response({
            "message": "Coupon API working 🚀"
        })