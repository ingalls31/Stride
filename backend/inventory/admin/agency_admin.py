from django.contrib import admin
from ..models import Agency

class AgencyAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "Total",
            {
                "fields": (
                    (
                        "total",
                        "buyed_total",
                        "ship_total",
                        "pending_total",
                        "cancelled_total",
                        "returned_total",
                    ),
                ),
            },
        ),
        (
            "Revenue",
            {
                "fields": (("revenue_total", "profit_total"),),
            },
        ),
        ("Agency", {"fields": ("name", "description")}),
        ("TimeBase", {"fields": (("created_at", "updated_at"),)}),
    )
    readonly_fields = (
        "created_at",
        "updated_at",
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )
    list_display = (
        "name",
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    ) 