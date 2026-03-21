from django.urls import path
from .views import CreateRazorpayOrderView, VerifyPaymentView

urlpatterns = [
    path('payments/create-order/', CreateRazorpayOrderView.as_view(), name='create-razorpay-order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='verify-payment'),
]
