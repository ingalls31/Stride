
from django.utils import timezone
import random
import string
import django
from django.db import models
from django.db.models import Sum
from inventory.models import Agency, Order, Product
from user.models import TimeBase, Statistics
from django.core.validators import MinValueValidator, MaxValueValidator
from .base import CampaignTime, Discount, PromotionType
import uuid

def generate_discount_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Promotion(TimeBase):
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
    
    discount = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        help_text="Enter a value from 0 to 100 to set the discount percentage.",
    )
    discount_code = models.CharField(
        max_length=6,
        default=generate_discount_code,
        null=True,
        blank=True,
    )
    
    @property
    def discount_info(self):
        return Discount(self.discount, self.discount_code)
    
    @property
    def promotion_type(self):
        return PromotionType(self.type)

    def __str__(self):
        return self.product.name + " - " + str(self.discount)

    class Meta:
        db_table = "promotion"