from rest_framework.test import APITestCase
from django.utils.timezone import now
from datetime import timedelta
from decimal import Decimal
from accounts.models import User
from coupons.models import Coupon
from core.models import PlatformFee
from django.urls import reverse

class CouponTest(APITestCase):

    def setUp(self):

        PlatformFee.objects.get_or_create(percentage=10)

        self.user = User.objects.create(
            email="test@test.com",
            phone="123"
        )

        self.coupon = Coupon.objects.create(
            code="TEST10",
            discount_type="PERCENT",
            discount_value=Decimal("10.00"),
            min_amount=Decimal("0"),
            max_discount=Decimal("50"),
            expiry_date=now() + timedelta(days=1),
            usage_limit=5,
            is_active=True
        )

    def test_apply_coupon(self):

        self.client.force_authenticate(user=self.user)

        url = reverse("coupons:apply_coupon")

        res = self.client.post(url, {
            "coupon_code": "TEST10",
            "amount": 100
        }, format="json")

        self.assertEqual(res.status_code, 200)
        self.assertIn("final_amount", res.data)