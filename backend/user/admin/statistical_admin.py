from django.contrib import admin

from ecommerce import settings
from django.utils.html import format_html
from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple
from user.models.statistical import Statistical
from django.contrib import admin
from django.core.serializers.json import DjangoJSONEncoder
import json


class OldAdmin(admin.ModelAdmin):
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
    )
    readonly_fields = (
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
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False



class StatisticalAdmin(admin.ModelAdmin):
    change_list_template = 'admin/base_site.html'

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        try:
            statistical = Statistical.objects.first()
            print("Statistical data:", statistical)  # Debug line
            chart_data = {
                'order_status': {
                    'labels': ['Total', 'Bought', 'Shipped', 'Pending', 'Cancelled', 'Returned'],
                    'data': [
                        statistical.total if statistical else 0,
                        statistical.buyed_total if statistical else 0,
                        statistical.ship_total if statistical else 0,
                        statistical.pending_total if statistical else 0,
                        statistical.cancelled_total if statistical else 0,
                        statistical.returned_total if statistical else 0
                    ]
                },
                'revenue': {
                    'labels': ['Revenue', 'Profit'],
                    'data': [
                        statistical.revenue_total if statistical else 0,
                        statistical.profit_total if statistical else 0
                    ]
                }
            }
            print("Chart data:", chart_data)  # Debug line
        except Exception as e:
            print("Error:", e)  # Debug line
            chart_data = {
                'order_status': {
                    'labels': ['Total', 'Bought', 'Shipped', 'Pending', 'Cancelled', 'Returned'],
                    'data': [0, 0, 0, 0, 0, 0]
                },
                'revenue': {
                    'labels': ['Revenue', 'Profit'],
                    'data': [0, 0]
                }
            }
        
        extra_context = extra_context or {}
        extra_context['chart_data'] = json.dumps(chart_data, cls=DjangoJSONEncoder)
        
        return super().changelist_view(request, extra_context=extra_context)
