# accounts/permissions.py
from rest_framework.permissions import BasePermission

class IsDriver(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "driver"

class IsPassenger(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == "passenger"