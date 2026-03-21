from django.contrib import admin
from .models import Payment, Wallet, WalletTransaction

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'booking', 'amount', 'status', 'razorpay_order_id']
    list_filter = ['status']

admin.site.register(Wallet)
admin.site.register(WalletTransaction)
