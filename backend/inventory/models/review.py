
from django.db import models
from user.models import TimeBase
import uuid
from user.models import Customer
from .order import OrderProduct
from .base import ReviewInfo


class Review(TimeBase):
    RATE_CHOICES = [
        (1, 1),
        (2, 2),
        (3, 3),
        (4, 4),
        (5, 5),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_product = models.ForeignKey(
        OrderProduct, on_delete=models.CASCADE, null=True, blank=True
    )
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    comment = models.TextField(null=True, blank=True)
    reply = models.TextField(null=True, blank=True)
    rate_point = models.IntegerField(choices=RATE_CHOICES, default=5)
    
    @property
    def review_info(self):
        return ReviewInfo(self.comment, self.reply, self.rate_point)
    

    class Meta:
        db_table = "review"