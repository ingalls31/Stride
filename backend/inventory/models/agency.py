import uuid
from django.db import models
from django.db.models import Sum
from user.models import TimeBase, Statistics
from .product import Product

class Agency(TimeBase, Statistics):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name

    def update_total(self):
        products = Product.objects.filter(agency=self).aggregate(
            sum_total=Sum("total"),
            sum_buyed_total=Sum("buyed_total"),
            sum_ship_total=Sum("ship_total"),
            sum_pending_total=Sum("pending_total"),
            sum_cancelled_total=Sum("cancelled_total"),
            sum_returned_total=Sum("returned_total"),
            sum_revenue_total=Sum("revenue_total"),
            sum_profit_total=Sum("profit_total"),
        )
        self.total = products["sum_total"]
        self.buyed_total = products["sum_buyed_total"]
        self.ship_total = products["sum_ship_total"]
        self.pending_total = products["sum_pending_total"]
        self.cancelled_total = products["sum_cancelled_total"]
        self.returned_total = products["sum_returned_total"]
        self.revenue_total = products["sum_revenue_total"]
        self.profit_total = products["sum_profit_total"]

    class Meta:
        db_table = "agency"
        app_label = "product" 
