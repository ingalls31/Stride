from django.contrib import admin
from django.utils.html import format_html
from django.conf import settings
from ..models import Product, ProductItem, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    fields = ("image", "image_preview", "primary")
    readonly_fields = ("image_preview",)
    extra = 1

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="150" height="auto"/>',
                f"{obj.image.image.url}",
            )
        return ""

    image_preview.short_description = "Preview"

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
            f"{product_image.image.image.url}",
        ) 