from django.db.models import Sum
from typing import Iterable
from django import db
from django.db import models
import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin, AbstractUser
from django.contrib.auth.models import Permission
from image.models import Image
# Create your models here.


class TimeBase(models.Model):
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True


class StatisticComplete:
    def __init__(self, buyed_total, cancelled_total, returned_total):
        self.buyed_total = buyed_total
        self.cancelled_total = cancelled_total
        self.returned_total = returned_total

    def __str__(self):
        return f"{self.buyed_total}, {self.cancelled_total}, {self.returned_total}"

    def get_total(self):
        return self.buyed_total + self.cancelled_total + self.returned_total


class StatisticNonComplete:
    def __init__(self, pending_total, ship_total):
        self.pending_total = pending_total
        self.ship_total = ship_total

    def __str__(self):
        return f"{self.pending_total}, {self.ship_total}"

    def get_total(self):
        return self.pending_total + self.ship_total


class StatisticMoney:
    def __init__(self, revenue_total, profit_total):
        self.revenue_total = revenue_total
        self.profit_total = profit_total

    def __str__(self):
        return f"{self.revenue_total}, {self.profit_total}"

    def get_total(self):
        return self.revenue_total + self.profit_total

    class Meta:
        abstract = True


class Statistics(models.Model):
    total = models.BigIntegerField(default=0)

    buyed_total = models.BigIntegerField(default=0)
    cancelled_total = models.BigIntegerField(default=0)
    returned_total = models.BigIntegerField(default=0)

    pending_total = models.BigIntegerField(default=0)
    ship_total = models.BigIntegerField(default=0)

    revenue_total = models.BigIntegerField(default=0)
    profit_total = models.BigIntegerField(default=0)

    @property
    def statistic_complete(self):
        return StatisticComplete(
            self.buyed_total, self.cancelled_total, self.returned_total
        )

    @property
    def statistic_non_complete(self):
        return StatisticNonComplete(self.pending_total, self.ship_total)

    @property
    def statistic_money(self):
        return StatisticMoney(self.revenue_total, self.profit_total)

    class Meta:
        abstract = True


class Statistical(Statistics):
    def update_total(self):
        from inventory.models import Agency

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

