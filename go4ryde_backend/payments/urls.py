from django.urls import path
from payments.views import create_payment, verify_payment

app_name = "payments"

urlpatterns = [
    path("create/", create_payment, name="create_payment"),
    path("verify/", verify_payment, name="verify_payment"),
]