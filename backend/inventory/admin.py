from typing import Any
from django.contrib import admin
from django.db.models.query import QuerySet
from django.http import HttpRequest
from django.utils.html import format_html
from ecommerce import settings
from ecommerce.settings import AUTH_PASSWORD_VALIDATORS
from . import models
from django_celery_beat.models import (
    CrontabSchedule,
    IntervalSchedule,
    SolarSchedule,
    ClockedSchedule,
)
from .models import (
    Product,
    Agency,
    Order,
    ProductItem,
    ProductImage,
    OrderProduct,
    Campaign,
    Promotion,
    Address,
    Warehouse,
)
# Register your models here.

admin.site.unregister(ClockedSchedule)
admin.site.unregister(CrontabSchedule)
admin.site.unregister(IntervalSchedule)
admin.site.unregister(SolarSchedule)


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    fields = ("image", "image_preview", "primary")
    readonly_fields = ("image_preview",)
    extra = 1

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="150" height="auto"/>',
                f"{settings.HOST}{obj.image.image.url}",
            )
        return ""

    image_preview.short_description = "Preview"


class OrderProductInline(admin.TabularInline):
    model = OrderProduct
    fields = (
        "productItem",
        "image",
        "quantity",
    )
    readonly_fields = ("image",)
    extra = 1

    def image(self, obj):
        product = obj.productItem.product
        product_image = ProductImage.objects.filter(
            product=product, primary=True
        ).first()
        return format_html(
            '<img src="{}" width="150" height="auto"/>',
            f"{settings.HOST}{product_image.image.image.url}",
        )


class ProductItemInline(admin.TabularInline):
    model = ProductItem
    fields = (
        "product",
        "size",
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
        "updated_at",
    )
    readonly_fields = (
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
        "updated_at",
    )
    extra = 1


class ProductAdmin(admin.ModelAdmin):
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
        (
            "Product",
            {
                "fields": (
                    "name",
                    "price",
                    "cost",
                    "agency",
                    "old_price",
                    "view",
                    "description",
                    "category",
                    "average_rating",
                )
            },
        ),
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
    inlines = [ProductItemInline, ProductImageInline]
    exclude = ["images", "comments", "ratings"]
    list_display = (
        "name",
        "image",
        "agency",
        "price",
        "cost",
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )
    list_filter = ("agency",)
    search_fields = ("name",)
    list_per_page = 30

    def image(self, obj):
        product_image = ProductImage.objects.filter(product=obj, primary=True).first()
        return format_html(
            '<img src="{}" width="150" height="auto"/>',
            f"{settings.HOST}{product_image.image.image.url}",
        )


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


class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderProductInline]
    fieldsets = (
        ("Order", {"fields": ("customer", "total_price", "status", "payment_done")}),
        ("TimeBase", {"fields": (("created_at", "updated_at"),)}),
    )
    readonly_fields = ("created_at", "updated_at")
    list_display = (
        "receiver",
        "phone",
        "address",
        "total_price",
        "payment_done",
        "status",
        "created_at",
        "updated_at",
    )
    list_filter = ("status",)
    sortable_by = ("updated_at", "total_price")
    search_fields = (
        "receiver",
        "phone",
    )

    # def get_queryset(self, request: HttpRequest) -> QuerySet[Any]:
    #     return super().get_queryset(request).filter(status__in=['pending', 'ship'])


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
    list_filter = ("address",)  # Nếu có nhiều warehouse ở các địa chỉ khác nhau
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


class CampaignAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "Total",
            {
                "fields": (
                    (
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
        (
            "Campaign",
            {
                "fields": (
                    "name",
                    (
                        "start_time",
                        "end_time",
                    ),
                    "discount",
                    "status",
                ),
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
        "name",
        "start_time",
        "end_time",
        "discount",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )


class PromotionAdmin(admin.ModelAdmin):
    fields = ("product", "quantity", "discount")
    fieldsets = (
        (
            "Promotion Info",
            {
                "fields": ("product", "quantity"),
            },
        ),
        (
            "TimeBase",
            {
                "fields": (("created_at", "updated_at"),),
            },
        ),
    )
    readonly_fields = ("created_at", "updated_at")
    list_display = ("product", "quantity", "created_at", "updated_at")
    list_filter = ("product",)
    search_fields = ("product__name",)
    list_per_page = 30

    def image_preview(self, obj):
        if obj.product:
            product_image = ProductImage.objects.filter(
                product=obj.product, primary=True
            ).first()
            if product_image:
                return format_html(
                    '<img src="{}" width="150" height="auto"/>',
                    f"{settings.HOST}{product_image.image.image.url}",
                )
        return ""

    image_preview.short_description = "Product Image Preview"
    readonly_fields = ("image_preview",)


admin.site.register(Address, AddressAdmin)
admin.site.register(Warehouse, WarehouseAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Agency, AgencyAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(Promotion, PromotionAdmin)
admin.site.register(Campaign, CampaignAdmin)