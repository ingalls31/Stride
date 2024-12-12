from user.models import Statistics, TimeBase
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import random
import string
import uuid
from .promotion import Promotion
from .base import CampaignTime, Discount
from .order import Order


def generate_discount_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Campaign(TimeBase, Statistics):
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
        default=generate_discount_code,
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
