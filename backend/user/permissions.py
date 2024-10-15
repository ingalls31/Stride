import logging

from rest_framework import permissions

from user.models import User

logger = logging.getLogger("file")


class IsStaffUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_staff

    def has_object_permission(self, request, view, obj):
        return request.user.is_staff


class IsStaffOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            return request.user.is_staff or request.user.is_superuser
        except:
            return False

    def has_object_permission(self, request, view, obj):
        try:
            return request.user.is_staff or request.user.is_superuser
        except:
            return False



class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            return request.user.is_superuser
        except:
            return False

    def has_object_permission(self, request, view, obj):
        try:
            return request.user.is_superuser
        except:
            return False


class IsActiveUser(permissions.BasePermission):
    def has_permission(self, request, view):
        try:
            return request.user.is_active
        except:
            return False

    def has_object_permission(self, request, view, obj):
        try:
            return request.user.is_active
        except:
            return False
