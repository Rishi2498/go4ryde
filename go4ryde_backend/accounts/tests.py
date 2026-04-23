from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from accounts.models import OTP, Profile, DriverProfile
from django.core.files.uploadedfile import SimpleUploadedFile
import tempfile
from PIL import Image
import os
from core.models import PlatformFee

PlatformFee.objects.get_or_create(percentage=10)
User = get_user_model()

def get_test_image():
    temp_file = tempfile.NamedTemporaryFile(suffix=".jpg", delete=False)
    image = Image.new("RGB", (100, 100), color="red")
    image.save(temp_file, format="JPEG")
    temp_file.close() # Close it so we can read it
    with open(temp_file.name, "rb") as f:
        data = f.read()
    os.unlink(temp_file.name) # Cleanup
    return SimpleUploadedFile("test.jpg", data, content_type="image/jpeg")

class OTPTests(APITestCase):

    def test_send_otp_success(self):
        url = reverse('send-otp')
        data = {"email": "test@example.com"}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "OTP sent")

    def test_verify_and_register_success(self):
        # Create OTP manually
        OTP.objects.create(email="test@example.com", otp="123456")
        
        url = reverse('register')
        data = {
            "email": "test@example.com", 
            "phone": "9876543210", 
            "otp": "123456"
        }

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertEqual(User.objects.filter(email="test@example.com").count(), 1)

class ProfileTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="driver@example.com", 
            phone="1234567890",
            password="pass1234", 
            role="PASSENGER" # Start as passenger
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('driver-upgrade')

    def test_driver_upgrade_success(self):
        profile_image = get_test_image()
        dl_image = get_test_image()
        rc_image = get_test_image()

        data = {
             "profile_image": profile_image,
             "dl_image": dl_image,
             "rc_image": rc_image,
             "vehicle_number": "TS09AB1234"
         }

        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, "DRIVER")
        self.assertEqual(DriverProfile.objects.filter(user=self.user).count(), 1)

    def test_get_profile_success(self):
        # Create driver profile first
        DriverProfile.objects.create(
            user=self.user,
            vehicle_number="TS09AB1234",
            profile_image=get_test_image(),
            dl_image=get_test_image(),
            rc_image=get_test_image()
        )
        self.user.role = "DRIVER"
        self.user.save()

        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["email"], "driver@example.com")
        self.assertEqual(response.data["vehicle_number"], "TS09AB1234")