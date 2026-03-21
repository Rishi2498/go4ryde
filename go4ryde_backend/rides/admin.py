from django.contrib import admin
from .models import Ride, Review


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    list_display = ['driver', 'ride_type', 'source_name', 'destination_name', 'departure_time', 'available_seats', 'is_active']
    list_filter = ['ride_type', 'is_active', 'women_only']
    search_fields = ['source_name', 'destination_name']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['ride', 'reviewer', 'driver', 'rating', 'created_at']
    list_filter = ['rating']
