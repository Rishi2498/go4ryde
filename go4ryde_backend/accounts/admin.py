from django.contrib import admin
from accounts.models import User, OTP, Profile, DriverProfile
from django.utils.html import format_html


# ---------------- USER ADMIN ----------------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "phone", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("email", "phone")

    ordering = ("-id",)

    fieldsets = (
        ("Basic Info", {
            "fields": ("username", "email", "phone", "role")
        }),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser")
        }),
    )


# ---------------- OTP ADMIN ----------------
@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("email", "otp", "created_at", "attempts", "is_verified", "is_expired_status")
    search_fields = ("email",)
    list_filter = ("is_verified", "created_at")

    readonly_fields = ("created_at",)

    def is_expired_status(self, obj):
        return obj.is_expired()
    is_expired_status.boolean = True
    is_expired_status.short_description = "Expired"


# ---------------- PROFILE ADMIN ----------------
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "image_preview")
    search_fields = ("user__email",)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" />', obj.image.url)
        return "-"
    image_preview.short_description = "Profile Image"


# ---------------- DRIVER PROFILE ADMIN ----------------
@admin.register(DriverProfile)
class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "vehicle_number", "dl_preview", "rc_preview", "profile_preview")
    search_fields = ("user__email", "vehicle_number")

    def dl_preview(self, obj):
        if obj.dl_image:
            return format_html('<img src="{}" width="50" height="50" />', obj.dl_image.url)
        return "-"
    dl_preview.short_description = "DL"

    def rc_preview(self, obj):
        if obj.rc_image:
            return format_html('<img src="{}" width="50" height="50" />', obj.rc_image.url)
        return "-"
    rc_preview.short_description = "RC"

    def profile_preview(self, obj):
        if obj.profile_image:
            return format_html('<img src="{}" width="50" height="50" />', obj.profile_image.url)
        return "-"
    profile_preview.short_description = "Profile"