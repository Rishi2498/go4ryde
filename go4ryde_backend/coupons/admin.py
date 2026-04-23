from django.contrib import admin
from coupons.models import Coupon

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'expiry_date']
    search_fields = ['code']