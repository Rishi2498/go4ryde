from rest_framework import serializers
from accounts.models import User, DriverProfile
import re
from payments.models import Wallet, BankAccount
from payments.serializers import BankAccountSerializer

# ---------------- REGISTER ----------------
class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=10)
    otp = serializers.CharField(max_length=6)

    def validate_phone(self, value):
        if not re.match(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError("Invalid Indian phone number")
        return value

    def validate(self, data):
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already exists")

        if User.objects.filter(phone=data['phone']).exists():
            raise serializers.ValidationError("Phone already exists")

        return data


# ---------------- LOGIN ----------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)


# ---------------- DRIVER ----------------
class DriverProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DriverProfile
        fields = '__all__'
        read_only_fields = ['user']
    def validate_vehicle_number(self, value):
    # 🔥 HANDLE EMPTY / NULL
        if not value:
           raise serializers.ValidationError("Vehicle number is required")

    # 🔥 NORMALIZE INPUT
        value = value.strip().upper()              # remove spaces at ends
        value = re.sub(r'[\s-]', '', value)        # remove spaces & dashes inside

    # ✅ STRICT INDIAN VEHICLE FORMAT
        pattern = r'^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$'

        if not re.fullmatch(pattern, value):       # 🔥 use fullmatch (better than match)
           raise serializers.ValidationError(
            "Invalid vehicle number (e.g. TS09AB1234)"
        )

        return value  # ✅ cleaned value saved in DB

class PassengerProfileSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(source='profile.image', read_only=True)
    wallet_balance = serializers.SerializerMethodField()  # ✅ NEW

    class Meta:
        model = User
        fields = ['email', 'phone', 'role', 'profile_image', 'wallet_balance']

    def get_wallet_balance(self, obj):
        wallet, _ = Wallet.objects.get_or_create(user=obj)
        return wallet.balance

# ---------------- DRIVER VIEW ----------------
class DriverProfileViewSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)

    wallet_balance = serializers.SerializerMethodField()  # ✅ NEW
    bank_account = serializers.SerializerMethodField()
    class Meta:
        model = DriverProfile
        fields = [
            'email',
            'phone',
            'role',
            'vehicle_number',
            'dl_image',
            'rc_image',
            'profile_image',
            'bank_account',
            'wallet_balance'   # ✅ IMPORTANT
        ]

    def get_wallet_balance(self, obj):
        wallet, _ = Wallet.objects.get_or_create(user=obj.user)
        return wallet.balance

    def get_bank_account(self, obj):

        try:
           bank = BankAccount.objects.get(user=obj.user)
           return (BankAccountSerializer(bank).data)
        except BankAccount.DoesNotExist:

            return None