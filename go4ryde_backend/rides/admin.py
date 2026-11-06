from django.contrib import admin
from rides.models import Ride, DriverLocation
from bookings.models import Booking


# 🔥 INLINE: BOOKINGS INSIDE RIDE
class BookingInline(admin.TabularInline):
    model = Booking
    extra = 0
    readonly_fields = ("user", "seats", "status", "payment_status", "created_at")
    can_delete = False


# 🔥 INLINE: DRIVER LOCATION (LIVE)
class DriverLocationInline(admin.TabularInline):
    model = DriverLocation
    extra = 0
    readonly_fields = ("lat", "lng", "updated_at")
    can_delete = False


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):

    # 📋 TABLE VIEW
    list_display = (
        "id",
        "driver",
        "source",
        "destination",
        "date_time",
        "price_per_seat",
        "seats_available",
        "seats_booked",
        "seats_remaining_display",
        "status",
    )

    # 🔍 SEARCH
    search_fields = (
        "driver__email",
        "source",
        "destination",
    )

    # 🎯 FILTERS
    list_filter = (
        "status",
        "date_time",
        "created_at",
    )

    # 📊 SORTING
    ordering = ("-created_at",)

    # 🔒 READ ONLY
    readonly_fields = (
        "distance_km",
        "duration_min",
        "route_geometry",
        "seats_booked",
        "created_at",
        "updated_at",
    )

    # 📦 FIELD GROUPING
    fieldsets = (
        ("Driver Info", {
            "fields": ("driver",)
        }),

        ("Location", {
            "fields": (
                "source", "source_lat", "source_lng",
                "destination", "destination_lat", "destination_lng"
            )
        }),

        ("Route Info", {
            "fields": ("distance_km", "duration_min", "route_geometry")
        }),

        ("Ride Details", {
            "fields": ("date_time", "price_per_seat")
        }),

        ("Seats", {
            "fields": ("seats_available", "seats_booked")
        }),

        ("Status", {
            "fields": ("status",)
        }),

        ("Meta", {
            "fields": ("created_at", "updated_at")
        }),
    )

    # 🔥 CUSTOM COLUMN
    def seats_remaining_display(self, obj):
        return obj.seats_remaining()
    seats_remaining_display.short_description = "Seats Left"

    # 🔥 INLINE VIEWS
    inlines = [BookingInline, DriverLocationInline]


@admin.register(DriverLocation)
class DriverLocationAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "ride",
        "lat",
        "lng",
        "updated_at",
    )

    search_fields = (
        "ride__source",
        "ride__destination",
    )

    list_filter = ("updated_at",)

    ordering = ("-updated_at",)

    readonly_fields = ("updated_at",)