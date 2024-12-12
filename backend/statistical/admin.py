from django.conf import settings
from django.contrib import admin
from django.http import HttpRequest

import django.utils.html
from inventory.models import ProductImage
from statistical.models import Statistical
from django.utils.html import format_html

# Register your models here.


class StatisticalAdmin(admin.ModelAdmin):
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


# class CampaignAdmin(admin.ModelAdmin):
#     fieldsets = (
#         (
#             "Total",
#             {
#                 "fields": (
#                     (
#                         "buyed_total",
#                         "ship_total",
#                         "pending_total",
#                         "cancelled_total",
#                         "returned_total",
#                     ),
#                 ),
#             },
#         ),
#         (
#             "Revenue",
#             {
#                 "fields": (("revenue_total", "profit_total"),),
#             },
#         ),
#         (
#             "Campaign",
#             {
#                 "fields": (
#                     "name",
#                     (
#                         "start_time",
#                         "end_time",
#                     ),
#                     "discount",
#                     "status",
#                 ),
#             },
#         ),
#     )
#     readonly_fields = (
#         "total",
#         "buyed_total",
#         "ship_total",
#         "pending_total",
#         "cancelled_total",
#         "returned_total",
#         "revenue_total",
#         "profit_total",
#     )
#     list_display = (
#         "name",
#         "start_time",
#         "end_time",
#         "discount",
#         "buyed_total",
#         "ship_total",
#         "pending_total",
#         "cancelled_total",
#         "returned_total",
#         "revenue_total",
#         "profit_total",
#     )


# class PromotionAdmin(admin.ModelAdmin):
#     fields = ("product", "quantity", "discount")
#     # fieldsets = (
#     #     (
#     #         "Promotion Info",
#     #         {
#     #             "fields": ("product", "quantity"),
#     #         },
#     #     ),
#     #     (
#     #         "TimeBase",
#     #         {
#     #             "fields": (("created_at", "updated_at"),),
#     #         },
#     #     ),
#     # )
#     readonly_fields = ("created_at", "updated_at")
#     list_display = ("product", "quantity", "created_at", "updated_at")
#     list_filter = ("product",)
#     search_fields = ("product__name",)
#     list_per_page = 30

#     def image_preview(self, obj):
#         if obj.product:
#             product_image = ProductImage.objects.filter(
#                 product=obj.product, primary=True
#             ).first()
#             if product_image:
#                 return format_html(
#                     '<img src="{}" width="150" height="auto"/>',
#                     f"{settings.HOST}{product_image.image.image.url}",
#                 )
#         return ""

#     image_preview.short_description = "Product Image Preview"
#     readonly_fields = ("image_preview",)  # Hiển thị hình ảnh sản phẩm trong admin


# Register the Promotion model with the PromotionAdmin
admin.site.register(Statistical, StatisticalAdmin)
