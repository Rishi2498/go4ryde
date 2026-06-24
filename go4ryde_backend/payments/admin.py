from django.contrib import admin
from payments.models import *
from notifications.dispatcher import NotificationDispatcher


# -------------------------
# 💳 PAYMENT ADMIN
# -------------------------
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking",
        "payment_type",
        "amount",
        "status",
        "is_final_payment",
        "created_at"
    )

    list_filter = ("payment_type", "status", "created_at")
    search_fields = (
        "booking__id",
        "razorpay_order_id",
        "razorpay_payment_id"
    )

    readonly_fields = (
        "razorpay_order_id",
        "razorpay_payment_id",
        "razorpay_signature",
        "created_at"
    )

    ordering = ("-created_at",)


# -------------------------
# 💰 WALLET ADMIN
# -------------------------
@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "balance", "updated_at")
    search_fields = ("user__email",)
    readonly_fields = ("updated_at",)

    ordering = ("-updated_at",)


# -------------------------
# 📊 WALLET TRANSACTION ADMIN
# -------------------------
@admin.register(WalletTransaction)
class WalletTransactionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "wallet",
        "transaction_type",
        "source",
        "amount",
        "reference_id",
        "created_at"
    )

    list_filter = ("transaction_type", "source", "created_at")

    search_fields = (
        "wallet__user__email",
        "reference_id"
    )

    readonly_fields = ("created_at",)

    ordering = ("-created_at",)



@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):

    # ✅ table columns
    list_display = (
        "id",
        "user",
        "account_holder_name",
        "bank_name",
        "account_number",
        "ifsc_code",
        "upi_id",
        "is_verified",
        "created_at",
    )

    # ✅ searchable fields
    search_fields = (
        "user__email",
        "account_holder_name",
        "bank_name",
        "account_number",
        "ifsc_code",
        "upi_id",
    )

    # ✅ filters
    list_filter = (
        "is_verified",
        "bank_name",
        "created_at",
    )

    # ✅ ordering
    ordering = (
        "-created_at",
    )

    # ✅ readonly fields
    readonly_fields = (
        "created_at",
    )

    # ✅ pagination
    list_per_page = 20

    # ✅ field layout
    fieldsets = (

        ("User Information", {
            "fields": (
                "user",
            )
        }),

        ("Bank Details", {
            "fields": (
                "account_holder_name",
                "bank_name",
                "account_number",
                "ifsc_code",
                "upi_id",
            )
        }),

        ("Verification", {
            "fields": (
                "is_verified",
            )
        }),

        ("Metadata", {
            "fields": (
                "created_at",
            )
        }),
    )


@admin.action(description="Approve Withdrawal")
def approve_withdrawal(
    modeladmin,
    request,
    queryset
):

    for withdrawal in queryset:

        withdrawal.status = "APPROVED"
        withdrawal.save()

        NotificationDispatcher.trigger(
            "WALLET_WITHDRAW_APPROVED",
            withdrawal,
            amount=withdrawal.amount,
            metadata={
                "route": "/wallet/withdrawals"
            }
        )


@admin.action(description="Mark As Paid")
def mark_paid(
    modeladmin,
    request,
    queryset
):

    for withdrawal in queryset:

        withdrawal.status = "PAID"
        withdrawal.save()

        NotificationDispatcher.trigger(
            "WALLET_WITHDRAW_APPROVED",
            withdrawal,
            amount=withdrawal.amount,
            metadata={
                "route": "/wallet/withdrawals"
            }
        )


@admin.action(description="Reject Withdrawal")
def reject_withdrawal(
    modeladmin,
    request,
    queryset
):

    for withdrawal in queryset:

        withdrawal.status = "REJECTED"
        withdrawal.save()

        NotificationDispatcher.trigger(
            "WALLET_WITHDRAW_REJECTED",
            withdrawal,
            amount=withdrawal.amount,
            metadata={
                "route": "/wallet/withdrawals"
            }
        )

@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "user",
        "amount",
        "status",
        "created_at",
    )

    actions = [
        approve_withdrawal,
        mark_paid,
        reject_withdrawal,
    ]