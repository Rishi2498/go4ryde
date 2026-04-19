from django.contrib import admin
from .models import *


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):

    # 🔥 LIST VIEW (TABLE)
    list_display = (
        "id",
        "user",
        "ride",
        "seats",
        "final_amount",
        "status",
        "payment_status",
        "created_at",
    )

    # 🔍 SEARCH
    search_fields = (
        "user__email",
        "ride__source",
        "ride__destination",
    )

    # 🎯 FILTERS
    list_filter = (
        "status",
        "payment_status",
        "created_at",
    )

    # 📊 SORTING
    ordering = ("-created_at",)

    # 📄 DETAIL VIEW
    readonly_fields = ("created_at",)

    # 📦 FIELD GROUPING
    fieldsets = (
        ("User & Ride Info", {
            "fields": ("user", "ride", "seats")
        }),

        ("Payment Info", {
            "fields": ("original_amount", "final_amount", "coupon", "payment_status")
        }),

        ("Status", {
            "fields": ("status",)
        }),

        ("Meta", {
            "fields": ("created_at",)
        }),
    )

from payments.models import Payment

class PaymentInline(admin.StackedInline):
    model = Payment
    extra = 0
    readonly_fields = ("amount", "status", "razorpay_order_id")
    can_delete = False


class BookingAdmin(admin.ModelAdmin):
    inlines = [PaymentInline]