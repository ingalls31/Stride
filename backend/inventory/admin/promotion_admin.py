from django.contrib import admin
from django.utils.html import format_html
from ecommerce import settings
from ..models import ProductImage


class PromotionAdmin(admin.ModelAdmin):
    fields = ("product", "quantity", "discount")
    # fieldsets = (
    #     (
    #         "Promotion Info",
    #         {
    #             "fields": ("product", "quantity"),
    #         },
    #     ),
    #     (
    #         "TimeBase",
    #         {
    #             "fields": (("created_at", "updated_at"),),
    #         },
    #     ),
    # )
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
