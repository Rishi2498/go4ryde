from django.contrib import admin
from .models import User, DriverProfile, OTPVerification

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'phone_number', 'role', 'is_active']
    search_fields = ['email', 'name', 'phone_number']

@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'vehicle_model_name', 'status', 'created_at']
    list_filter = ['status']
    actions = ['approve_drivers', 'reject_drivers']

    def approve_drivers(self, request, queryset):
        queryset.update(status='approved')
    
    def reject_drivers(self, request, queryset):
        queryset.update(status='rejected')

admin.site.register(OTPVerification)
