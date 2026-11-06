from core.models import PlatformFee

PlatformFee.objects.get_or_create(percentage=10)