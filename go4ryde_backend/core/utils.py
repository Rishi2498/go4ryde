from core.models import PlatformFee

def get_platform_fee():
    fee = PlatformFee.objects.first()
    return fee.percentage if fee else 10