from django.contrib import admin
from .models import DriverLocation, DriverLocationHistory


# 🚗 LIVE DRIVER LOCATION (REAL-TIME)
@admin.register(DriverLocation)
class DriverLocationAdmin(admin.ModelAdmin):

    list_display = (
        "ride",
        "driver",
        "lat",
        "lng",
        "speed",
        "heading",
        "updated_at",
    )

    list_filter = (
        "driver",
        "updated_at",
    )

    search_fields = (
        "ride__id",
        "driver__email",
    )

    ordering = ("-updated_at",)

    readonly_fields = ("updated_at",)

    # 🔥 Optimize queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("ride", "driver")


# 📍 LOCATION HISTORY (TRACKING TIMELINE)
@admin.register(DriverLocationHistory)
class DriverLocationHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "ride",
        "driver",
        "lat",
        "lng",
        "timestamp",
    )

    list_filter = (
        "driver",
        "timestamp",
    )

    search_fields = (
        "ride__id",
        "driver__email",
    )

    ordering = ("-timestamp",)

    readonly_fields = ("timestamp",)

    # 🔥 Optimize queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related("ride", "driver")