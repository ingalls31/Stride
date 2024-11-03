from django import db
from django.db import models
from django.db.models import Sum
from product.models import Agency, Order, Product
from user.models import TimeBase, Statistics
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# Create your models here.

class PromotionType(models.Model):
    FLASH_DEAL = 'flash_deal'
    PRODUCT_DISCOUNT = 'product_discount'
    PROMOTION_TYPE_CHOICES = [
        (FLASH_DEAL, 'Flash Deal'),
        (PRODUCT_DISCOUNT, 'Product Discount')
    ]
    type = models.CharField(max_length=255, choices=PROMOTION_TYPE_CHOICES)
    
    class Meta:
        abstract = True

class CampaignTime(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    class Meta:
        abstract = True
        
class Discount(models.Model):
    discount = models.IntegerField(
        default=0,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ],
        help_text="Enter a value from 0 to 100 to set the discount percentage."
    )
    discount_code = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        abstract = True
    

class Statistical(Statistics):
    
    def update_total(self):
        agencies = Agency.objects\
        .all() \
        .aggregate(
            sum_total=Sum('total'),
            sum_buyed_total=Sum('buyed_total'),
            sum_ship_total=Sum('ship_total'),
            sum_pending_total=Sum('pending_total'),
            sum_cancelled_total=Sum('cancelled_total'),
            sum_returned_total=Sum('returned_total'),
            sum_revenue_total=Sum('revenue_total'),
            sum_profit_total=Sum('profit_total'),
        )
        self.total = agencies['sum_total']
        self.buyed_total = agencies['sum_buyed_total']
        self.ship_total = agencies['sum_ship_total']
        self.pending_total = agencies['sum_pending_total']
        self.cancelled_total = agencies['sum_cancelled_total']
        self.returned_total = agencies['sum_returned_total']
        self.revenue_total = agencies['sum_revenue_total']
        self.profit_total = agencies['sum_profit_total']
    
    class Meta:
        db_table = "statiscal"
        
class Campaign(TimeBase, Statistics, CampaignTime, Discount):
    PENDING = 'pending'
    RUNNING = 'running'
    CLOSE = 'close'
    STATUS = [
        (PENDING, 'pending'),
        (RUNNING, 'running'),
        (CLOSE, 'close'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS, default=PENDING)
    orders = models.ManyToManyField(Order, related_name='CampaignOrder', blank=True)
    
    class Meta:
        db_table = "campaign"
        
class Promotion(TimeBase, Discount, PromotionType):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    
    class Meta:
        db_table = "promotion"
        
class CampaignOrder(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    promotions = models.ManyToManyField(Promotion, related_name='CampaignPromotion', blank=True)
    
    class Meta:
        db_table = "campaign_order"
        
class CampaignPromotion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)
    
    class Meta:
        db_table = "campaign_promotion"
