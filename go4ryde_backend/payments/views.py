import razorpay
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Payment, Wallet, WalletTransaction
from bookings.models import Booking

from bookings.forms import PaymentForm

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        form = PaymentForm(data=request.data, user=request.user)
        if not form.is_valid():
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
        
        booking = form._booking
        amount_in_paise = int(booking.total_price * 100)

        amount_in_paise = int(booking.total_price * 100)
        
        try:
            razorpay_order = razorpay_client.order.create({
                "amount": amount_in_paise,
                "currency": "INR",
                "payment_capture": "1"
            })
            
            payment = Payment.objects.create(
                booking=booking,
                razorpay_order_id=razorpay_order['id'],
                amount=booking.total_price
            )
            
            return Response({
                'order_id': razorpay_order['id'],
                'amount': amount_in_paise,
                'currency': "INR"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        
        try:
            payment = Payment.objects.get(razorpay_order_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response({'error': 'Payment record not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
            
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'success'
            payment.save()

            # Confirm booking
            booking = payment.booking
            booking.status = 'confirmed'
            booking.save()

            return Response({'message': 'Payment successful and booking confirmed.'}, status=status.HTTP_200_OK)
        except razorpay.errors.SignatureVerificationError:
            payment.status = 'failed'
            payment.save()
            return Response({'error': 'Payment verification failed.'}, status=status.HTTP_400_BAD_REQUEST)
