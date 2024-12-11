from django.contrib import admin
from django.utils.html import format_html
from django.conf import settings
from ..models import Order, OrderProduct, ProductImage

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