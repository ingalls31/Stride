from django.contrib import admin
from ..models import Warehouse, Address

class WarehouseAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "Warehouse Info",
            {
                "fields": ("name", "address"),
            },
        ),
        (
            "TimeBase",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    list_display = ("name", "address", "created_at", "updated_at")
    list_filter = ("address",)
    search_fields = ("name",)

class AddressAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "Address Information",
            {
                "fields": ("city", "address", "region", "postal_code"),
            },
        ),
        (
            "TimeBase",
            {
                "fields": ("created_at", "updated_at"),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    list_display = (
        "city",
        "address",
        "region",
        "postal_code",
        "created_at",
        "updated_at",
    )
    search_fields = ("city", "address", "region", "postal_code")
    list_filter = ("city", "region")
    list_per_page = 20 