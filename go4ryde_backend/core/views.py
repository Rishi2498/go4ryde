from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.conf import settings


@api_view(["POST"])
def test_email(request):
    subject = "Test Email from Django"
    message = "This email was sent successfully from Django!"
    from_email = settings.EMAIL_HOST_USER
    to_email = [settings.EMAIL_HOST_USER]

    try:
        send_mail(subject, message, from_email, to_email)
        return Response(
            {"message": "Email sent successfully"},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    