from django.urls import path
from coupons.views import ApplyCouponView, CouponHomeView

app_name = "coupons"

urlpatterns = [
    path('', CouponHomeView.as_view(), name="home"),
    path('apply/', ApplyCouponView.as_view(), name="apply_coupon"),
]