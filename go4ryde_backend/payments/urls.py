from django.urls import path
from payments.views import *

app_name = "payments"

urlpatterns = [
    path("create/", create_payment, name="create_payment"),
    path("verify/", verify_payment, name="verify_payment"),
    path("webhook/razorpay/", razorpay_webhook, name="razorpay-webhook"),
    path("wallet/topup/", create_wallet_topup, name="create_wallet_topup"),
    path("wallet/verify/", verify_wallet_topup, name="verify_wallet_topup"),
    path("wallet/withdraw/", withdraw_wallet, name="withdraw_wallet"),
    path("bank-account/",save_bank_account,name="save_bank_account"),
    path("wallet/my-withdrawals/",my_withdrawals,name="my_withdrawals"),

]