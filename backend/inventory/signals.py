# import datetime
# import json
# from tkinter.messagebox import CANCEL
# import rest_framework
# from uu import Error
# from django.db.models.signals import post_save, pre_save
# from django.db import transaction
# from django.dispatch import receiver
# from django.db.models import Sum, Count
# from django.db import transaction, IntegrityError
# from django.utils import timezone
# import pytz
# from ecommerce import settings
# from inventory.models import Agency, Order, OrderProduct, Product, ProductItem, Review
# from statistical.models import Campaign, Promotion, Statistical
# from django_celery_beat.models import PeriodicTask, CrontabSchedule
# from django.db.models import F
# from inventory.models import Order


# @receiver(post_save, sender=ProductItem)
# def update_product_total(sender, instance, **kwargs):
#     instance.product.update_total()
#     instance.product.save()


# @receiver(pre_save, sender=OrderProduct)
# def update_promotion_quantity(sender, instance, **kwargs):
#     promotion = Promotion.objects.get(
#         product=instance.productItem.product, quantity__gt=0
#     )
#     if (
#         promotion
#         and instance.order.status == Order.PENDING
#         and instance.quantity < promotion.quantity
#     ):
#         promotion.quantity -= instance.quantity
#         promotion.save()


# @receiver(pre_save, sender=Order)
# def update_order_status(sender, instance, **kwargs):
#     try:
#         tz = pytz.timezone(settings.TIME_ZONE)
#         time_now = timezone.now().astimezone(tz)
#         campaigns = Campaign.objects.filter(
#             start_time__lte=time_now, end_time__gte=time_now, status=Campaign.RUNNING
#         )
#         old_instance = Order.objects.get(id=instance.id)
#         user = instance.user

#         if old_instance and old_instance.status != instance.status:
#             # Creating(0) -> Pending(0)    ->   Ship(-1) -> Complete(0)
#             #            |                              |
#             #            -> Cancel(0)                   -> Return(+1)
#             pre_status = old_instance.status
#             status = instance.status

#             products = OrderProduct.objects.filter(order=old_instance)

#             for order_product in products:
#                 productItem = order_product.productItem
#                 product = productItem.product

#                 match status:
#                     case Order.PENDING:
#                         # productItem
#                         productItem.pending_total += order_product.quantity
#                         # user
#                         user.pending_total += order_product.quantity
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.pending_total += order_product.quantity

#                     case Order.CANCEL:
#                         # productItem
#                         productItem.cancelled_total += order_product.quantity
#                         # user
#                         user.cancelled_total += order_product.quantity
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.cancelled_total += order_product.quantity

#                     case Order.SHIP:
#                         # productItem
#                         productItem.total -= order_product.quantity
#                         productItem.ship_total += order_product.quantity
#                         # user
#                         user.total -= order_product.quantity
#                         user.ship_total += order_product.quantity
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.total -= order_product.quantity
#                             campaign.ship_total += order_product.quantity

#                     case Order.RETURN:
#                         # productItem
#                         productItem.total += order_product.quantity
#                         productItem.returned_total += order_product.quantity
#                         # user
#                         user.total += order_product.quantity
#                         user.returned_total += order_product.quantity
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.total += order_product.quantity
#                             campaign.returned_total += order_product.quantity

#                     case Order.COMPLETE:
#                         # productItem
#                         productItem.buyed_total += order_product.quantity
#                         productItem.revenue_total += (
#                             order_product.quantity * product.price
#                         )
#                         productItem.profit_total += order_product.quantity * (
#                             product.price - product.cost
#                         )
#                         # user
#                         user.buyed_total += order_product.quantity
#                         user.revenue_total += order_product.quantity * product.price
#                         user.profit_total += order_product.quantity * (
#                             product.price - product.cost
#                         )
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.buyed_total += order_product.quantity
#                             campaign.revenue_total += (
#                                 order_product.quantity * product.price
#                             )
#                             campaign.profit_total += order_product.quantity * (
#                                 product.price - product.cost
#                             )

#                     case _:
#                         pass

#                 match pre_status:
#                     case Order.PENDING:
#                         # productItem
#                         productItem.pending_total -= order_product.quantity
#                         # user
#                         user.pending_total -= order_product.quantity
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.pending_total -= order_product.quantity

#                     case Order.SHIP:
#                         # productItem
#                         productItem.ship_total -= order_product.quantity
#                         # user
#                         user.ship_total -= order_product.quantity
#                         # campaign
#                         for campaign in campaigns:
#                             campaign.ship_total -= order_product.quantity

#                     case _:
#                         pass

#                 productItem.save()
#                 product.save()
#                 user.save()
#                 campaigns.bulk_update(
#                     campaigns,
#                     [
#                         "total",
#                         "buyed_total",
#                         "ship_total",
#                         "pending_total",
#                         "cancelled_total",
#                         "returned_total",
#                         "revenue_total",
#                         "profit_total",
#                     ],
#                 )

#             pass
#     except:
#         print("[ New Order ]")


# @receiver(post_save, sender=Agency)
# def update_statistical(sender, instance, **kwargs):
#     statistical = Statistical.objects.first()
#     try:
#         with transaction.atomic():
#             statistical.update_total()
#             statistical.save()
#     except IntegrityError:
#         print("An error occurred while updating the agency.")


# @receiver(post_save, sender=Product)
# def update_agency(sender, instance, **kwargs):
#     agency = instance.agency
#     try:
#         with transaction.atomic():
#             agency.update_total()
#             agency.save()
#     except IntegrityError:
#         print("An error occurred while updating the agency.")


# @receiver(post_save, sender=ProductItem)
# def update_product(sender, instance, **kwargs):
#     product = instance.product
#     try:
#         with transaction.atomic():
#             product.update_total()
#             product.save()
#     except IntegrityError:
#         print("An error occurred while updating the agency.")


# @receiver(post_save, sender=Review)
# def update_rating(sender, instance, **kwargs):
#     product = instance.order_product.productItem.product
#     product_rating = Review.objects.filter(
#         order_product__productItem__product=product
#     ).aggregate(sum_rate=Sum("rate_point"), count_review=Count("id"))

#     product.average_rating = (
#         product_rating["sum_rate"] // product_rating["count_review"]
#     )
#     product.save()
#     print("[ End update rating ]")


# @receiver(post_save, sender=Campaign)
# def update_campaign(sender, instance, **kwargs):
#     tz = pytz.timezone(settings.TIME_ZONE)
#     time_now = timezone.now().astimezone(tz)
#     campaign = Campaign.objects.filter(
#         start_time__lte=time_now, end_time__gte=time_now, status=Campaign.RUNNING
#     ).aggregate(sum_discount=Sum("discount"))

#     sum_discount = campaign["sum_discount"] if campaign["sum_discount"] else 0

#     products = Product.objects.all()
#     for product in products:
#         product.price = product.old_price * (100 - sum_discount) // 100

#     products.bulk_update(products, ["price"])
#     schedule_task(instance)


# def schedule_task(campaign):
#     print("[ Start schedule ]")
#     PeriodicTask.objects.filter(name__endswith=campaign.id).delete()
#     start_schedule, _ = CrontabSchedule.objects.get_or_create(
#         minute=campaign.start_time.minute,
#         hour=campaign.start_time.hour,
#         day_of_month=campaign.start_time.day,
#         month_of_year=campaign.start_time.month,
#         day_of_week="*",
#         timezone=str(campaign.start_time.tzinfo),
#     )
#     PeriodicTask.objects.create(
#         crontab=start_schedule,
#         name=f"Start campaign {campaign.id}",
#         task="ecommerce.update_campaign_status",
#         args=json.dumps([str(campaign.id)]),
#     )

#     end_schedule, _ = CrontabSchedule.objects.get_or_create(
#         minute=campaign.end_time.minute,
#         hour=campaign.end_time.hour,
#         day_of_month=campaign.end_time.day,
#         month_of_year=campaign.end_time.month,
#         day_of_week="*",
#         timezone=str(campaign.end_time.tzinfo),
#     )
#     PeriodicTask.objects.create(
#         crontab=end_schedule,
#         name=f"End campaign {campaign.id}",
#         task="ecommerce.update_campaign_status",
#         args=json.dumps([str(campaign.id)]),
#     )


# @receiver(post_save, sender=Promotion)
# def update_product_price(sender, instance, created, **kwargs):
#     if created:
#         instance.product.price = (
#             instance.product.old_price * (100 - instance.discount) // 100
#         )
#         instance.product.save()
#     elif instance.quantity == 0:
#         instance.product.price = instance.product.old_price
#         instance.product.save()
