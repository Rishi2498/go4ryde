from django.contrib import admin
from .models import Booking, BookingCancellation

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'ride', 'passenger', 'seats', 'status', 'created_at']
    list_filter = ['status']

admin.site.register(BookingCancellation)
