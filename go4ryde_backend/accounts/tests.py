from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from .models import OTP, Profile
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()
from PIL import Image
import tempfile
from django.core.files.uploadedfile import SimpleUploadedFile

def get_test_image():
    temp_file = tempfile.NamedTemporaryFile(suffix=".jpg")
    image = Image.new("RGB", (100, 100), color="red")
    image.save(temp_file, format="JPEG")
    temp_file.seek(0)
    return SimpleUploadedFile(temp_file.name, temp_file.read(), content_type="image/jpeg")
    
class OTPTests(APITestCase):

    def test_send_otp_success(self):
        url = reverse('send-otp')  # Make sure this matches your urls.py
        data = {"email": "test@example.com", "role": "passenger"}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)

    def test_verify_otp_success(self):
        # Create OTP manually
        otp_obj = OTP.objects.create(
            email="test@example.com",
            otp="1234",
            expires_at=timezone.now() + timedelta(minutes=5)
        )
        url = reverse('verify-otp')
        data = {"email": "test@example.com", "otp": "1234"}

        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

class ProfileTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(email="driver@example.com", password="pass1234", role="driver")
        self.client.force_authenticate(user=self.user)
        self.url = reverse('profile-create')  # Match urls.py

    def test_profile_create_with_files(self):
        profile_image = SimpleUploadedFile("profile.jpg", b"img", content_type="image/jpeg")
        driving_license = SimpleUploadedFile("license.jpg", b"img", content_type="image/jpeg")
        rc_document = SimpleUploadedFile("rc.jpg", b"img", content_type="image/jpeg")

        data = {
             "profile_image": profile_image,
             "driving_license": driving_license,
             "rc_document": rc_document,
             "vehicle_number": "KA01AB1234",
             "phone_number": "9876543210"  # Include if required
         }

        response = self.client.post(self.url, data, format='multipart')

        print(response.status_code)
        print("R:", response.data)  # <-- Debug exact validation errors

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

class ProfileStatusTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(email="driver2@example.com", password="pass1234", role="driver")
        self.profile = Profile.objects.create(user=self.user, vehicle_number="KA01AB1234")
        self.client.force_authenticate(user=self.user)
        self.url = reverse('profile-status')

    def test_incomplete_profile_status(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data['is_complete'])

    def test_complete_profile_status(self):
        # Add missing fields
        self.profile.profile_image = SimpleUploadedFile("profile.jpg", b"file_content", content_type="image/jpeg")
        self.profile.driving_license = SimpleUploadedFile("license.jpg", b"file_content", content_type="image/jpeg")
        self.profile.rc_document = SimpleUploadedFile("rc.jpg", b"file_content", content_type="image/jpeg")
        self.profile.save()

        response = self.client.get(self.url)
        self.assertTrue(response.data['is_complete'])