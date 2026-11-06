from django.urls import path
from tracking.views import update_location, get_driver_location

app_name = "tracking"

urlpatterns = [
    path("update-location/", update_location, name="update_location"),
    path("driver-location/<int:ride_id>/", get_driver_location, name="get_driver_location"),
]