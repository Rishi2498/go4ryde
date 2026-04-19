from django.urls import path
from .views import ApplyCouponView , CouponHomeView

urlpatterns = [
    path('', CouponHomeView.as_view()),   # ✅ now base works
    path('apply/', ApplyCouponView.as_view()),
    ]