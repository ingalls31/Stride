from django.contrib import admin
from django.http import HttpRequest

from statistical.models import Campaign, Statistical

# Register your models here.

class StatisticalAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Total', {
            'fields': (('total', 'buyed_total', 'ship_total', 'pending_total', 'cancelled_total', 'returned_total'),),
            }),
        ('Revenue', {
            'fields': (('revenue_total', 'profit_total'),),
            }),
    )
    readonly_fields = ('total', 'buyed_total', 'ship_total', 'pending_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total')
    list_display = ('total', 'buyed_total', 'ship_total', 'pending_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total')
    
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
    
class CampaignAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Total', {
            'fields': (('buyed_total', 'ship_total', 'pending_total', 'cancelled_total', 'returned_total'),),
            }),
        ('Revenue', {
            'fields': (('revenue_total', 'profit_total'),),
            }),
        ('Campaign', {
            'fields': ('name', ('start_time', 'end_time',), 'discount', 'status',),
        })
    )
    readonly_fields = ('total', 'buyed_total', 'ship_total', 'pending_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total')
    list_display = ('name', 'start_time', 'end_time', 'discount', 'buyed_total', 'ship_total', 'pending_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total')
    
    
    
admin.site.register(Statistical, StatisticalAdmin)
admin.site.register(Campaign, CampaignAdmin)
