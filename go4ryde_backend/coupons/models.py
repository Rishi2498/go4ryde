from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now

User = get_user_model()


class Coupon(models.Model):

    code = models.CharField(
        max_length=20,
        unique=True,
        db_index=True
    )

    DISCOUNT_TYPE = (
        ('FLAT', 'Flat'),
        ('PERCENT', 'Percentage'),
    )
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPE)

    discount_value = models.DecimalField(max_digits=10, decimal_places=2)

    min_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    max_discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    expiry_date = models.DateTimeField()

    usage_limit = models.PositiveIntegerField(default=1)
    used_count = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    users_used = models.ManyToManyField(User, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    # -------------------------
    # 🔥 CORE BUSINESS LOGIC
    # -------------------------

    def is_valid(self, user, amount):
        """
        Validate coupon before applying
        """

        if not self.is_active:
            return False, "Coupon is inactive"

        if self.expiry_date < now():
            return False, "Coupon expired"

        if amount < self.min_amount:
            return False, f"Minimum amount should be ₹{self.min_amount}"

        if self.used_count >= self.usage_limit:
            return False, "Coupon usage limit reached"

        if user in self.users_used.all():
            return False, "You already used this coupon"

        return True, "Valid coupon"

    # -------------------------
    # 💰 APPLY DISCOUNT
    # -------------------------

    def apply_discount(self, amount):

        if self.discount_type == "FLAT":
            discount = self.discount_value

        else:  # PERCENT
            discount = (amount * self.discount_value) / 100

        # 🔥 APPLY MAX CAP
        if self.max_discount:
            discount = min(discount, self.max_discount)

        final_amount = max(amount - discount, 0)

        return round(final_amount, 2), round(discount, 2)

    # -------------------------
    # 📊 TRACK USAGE
    # -------------------------

    def mark_used(self, user):
        self.used_count += 1
        self.users_used.add(user)
        self.save()

    def __str__(self):
        return f"{self.code} ({self.discount_type})"