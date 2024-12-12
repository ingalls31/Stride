from .product_admin import ProductAdmin
from .order_admin import OrderAdmin
from .agency_admin import AgencyAdmin
from .warehouse_admin import WarehouseAdmin, AddressAdmin
from .promotion_admin import PromotionAdmin
from .campaign_admin import CampaignAdmin
from ..models import Product, Order, Agency, Warehouse, Address, Promotion, Campaign

from django.contrib import admin
from django_celery_beat.models import (
    PeriodicTask,
    CrontabSchedule,
    IntervalSchedule,
    SolarSchedule,
    ClockedSchedule,
)

# Unregister celery models
admin.site.unregister(ClockedSchedule)
admin.site.unregister(CrontabSchedule)
admin.site.unregister(IntervalSchedule)
admin.site.unregister(SolarSchedule)
admin.site.unregister(PeriodicTask)

# Register our models
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Agency, AgencyAdmin)
admin.site.register(Warehouse, WarehouseAdmin)
admin.site.register(Address, AddressAdmin)
admin.site.register(Promotion, PromotionAdmin)
admin.site.register(Campaign, CampaignAdmin)
