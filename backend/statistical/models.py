from django.utils import timezone
import random
import string
import django
from django.db import models
from django.db.models import Sum
from inventory.models import Agency, Order, Product
from user.models import TimeBase, Statistics
import uuid

# Create your models here.


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
