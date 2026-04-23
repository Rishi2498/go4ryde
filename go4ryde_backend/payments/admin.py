from django.contrib import admin
from payments.models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    # 📋 TABLE VIEW
    list_display = (
        "id",
        "booking",
        "user_email",
        "amount",
        "status",
        "razorpay_order_id",
        "created_at",
    )

    # 🔍 SEARCH
    search_fields = (
        "booking__user__email",
        "razorpay_order_id",
        "razorpay_payment_id",
    )

    # 🎯 FILTERS
    list_filter = (
        "status",
        "created_at",
    )

    # 📊 SORTING
    ordering = ("-created_at",)

    # 🔒 READ ONLY (VERY IMPORTANT)
    readonly_fields = (
        "booking",
        "amount",
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "created_at",
    )

    # 📦 DETAIL VIEW GROUPING
    fieldsets = (
        ("Booking Info", {
            "fields": ("booking",)
        }),

        ("Payment Info", {
            "fields": (
                "amount",
                "status",
            )
        }),

        ("Razorpay Details", {
            "fields": (
                "razorpay_order_id",
                "razorpay_payment_id",
                "razorpay_signature",
            )
        }),

        ("Meta", {
            "fields": ("created_at",)
        }),
    )

    # 🔥 CUSTOM COLUMN → USER EMAIL
    def user_email(self, obj):
        return obj.booking.user.email
    user_email.short_description = "User"