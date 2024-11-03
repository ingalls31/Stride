from django.db import models
from django.db.models import Sum
from product.models import Agency
from user.models import TimeBase, Statistics
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# Create your models here.

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
    
    class Meta:
        db_table = "campaign"