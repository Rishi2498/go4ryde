from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class SendOTPThrottle(AnonRateThrottle):
    scope = "send_otp"


class VerifyOTPThrottle(AnonRateThrottle):
    scope = "verify_otp"


class LoginThrottle(AnonRateThrottle):
    scope = "login"


class ProfileThrottle(UserRateThrottle):
    scope = "profile"


class DriverUpgradeThrottle(UserRateThrottle):
    scope = "driver_upgrade"
    