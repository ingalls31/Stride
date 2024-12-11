from django.utils import timezone
import random
import string
import django
from django.db import models
from django.db.models import Sum
from inventory.models import Agency, Order, Product
from user.models import TimeBase, Statistics
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# Create your models here.


class PromotionType:
    def __init__(self, type):
        self.type = type
        
    def get_type(self):
        return self.type
    

class CampaignTime:
    def __init__(self, start_time, end_time):
        self.start_time = start_time
        self.end_time = end_time
        
    def get_time(self):
        return self.start_time, self.end_time
    
    def check_time(self):
        return self.start_time < timezone.now() and self.end_time > timezone.now()


class Discount:
    def __init__(self, discount, discount_code):
        self.discount = discount
        self.discount_code = discount_code
        
    def get_discount(self):
        return self.discount, self.discount_code
    


class Statistical(Statistics):
    def update_total(self):
        agencies = Agency.objects.all().aggregate(
            sum_total=Sum("total"),
            sum_buyed_total=Sum("buyed_total"),
            sum_ship_total=Sum("ship_total"),
            sum_pending_total=Sum("pending_total"),
            sum_cancelled_total=Sum("cancelled_total"),
            sum_returned_total=Sum("returned_total"),
            sum_revenue_total=Sum("revenue_total"),
            sum_profit_total=Sum("profit_total"),
        )
        self.total = agencies["sum_total"]
        self.buyed_total = agencies["sum_buyed_total"]
        self.ship_total = agencies["sum_ship_total"]
        self.pending_total = agencies["sum_pending_total"]
        self.cancelled_total = agencies["sum_cancelled_total"]
        self.returned_total = agencies["sum_returned_total"]
        self.revenue_total = agencies["sum_revenue_total"]
        self.profit_total = agencies["sum_profit_total"]

    class Meta:
        db_table = "statiscal"


class Campaign(TimeBase, Statistics, Discount):
    PENDING = "pending"
    RUNNING = "running"
    CLOSE = "close"
    STATUS = [
        (PENDING, "pending"),
        (RUNNING, "running"),
        (CLOSE, "close"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS, default=PENDING)
    orders = models.ManyToManyField(Order, related_name="CampaignOrder", blank=True)
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    discount = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Enter a value from 0 to 100 to set the discount percentage.",
    )
    discount_code = models.CharField(
        max_length=6,
        default=lambda: "".join(
            random.choices(string.ascii_uppercase + string.digits, k=6)
        ),
        null=True,
        blank=True,
    )
    
    @property
    def campaign_time(self):
        return CampaignTime(self.start_time, self.end_time)
    
    @property
    def discount_info(self):
        return Discount(self.discount, self.discount_code)


    class Meta:
        db_table = "campaign"


class Promotion(TimeBase, Discount, PromotionType):
    FLASH_DEAL = "flash_deal"
    PRODUCT_DISCOUNT = "product_discount"
    PROMOTION_TYPE_CHOICES = [
        (FLASH_DEAL, "Flash Deal"),
        (PRODUCT_DISCOUNT, "Product Discount"),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    
    type = models.CharField(
        max_length=255, choices=PROMOTION_TYPE_CHOICES, default=PRODUCT_DISCOUNT
    )
    
    @property
    def promotion_type(self):
        return PromotionType(self.type)

    def __str__(self):
        return self.product.name + " - " + str(self.discount)

    class Meta:
        db_table = "promotion"


class CampaignOrder(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    promotions = models.ManyToManyField(
        Promotion, related_name="CampaignPromotion", blank=True
    )

    class Meta:
        db_table = "campaign_order"


class CampaignPromotion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    promotion = models.ForeignKey(Promotion, on_delete=models.CASCADE)

    class Meta:
        db_table = "campaign_promotion"
