from core.models import PlatformFee
from decimal import Decimal

def get_platform_fee():
    fee = PlatformFee.objects.first()
    return Decimal(str(fee.percentage)) if fee else Decimal("10")