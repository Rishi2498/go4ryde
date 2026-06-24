from rest_framework.throttling import UserRateThrottle, AnonRateThrottle


class DriverLocationUpdateThrottle(UserRateThrottle):
    scope = "driver_location_update"


class DriverLocationReadThrottle(AnonRateThrottle):
    scope = "driver_location_read"