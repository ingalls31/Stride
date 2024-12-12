import uuid
from django.db import models
from django.db.models import Sum
from user.models import TimeBase, Statistics
from image.models import Image
from .base import ProductInfo, Price
from .agency import Agency
from .warehouse import Warehouse

class Product(TimeBase, Statistics):
    MALE = "male"
    FEMALE = "female"
    CATEGORY_CHOICE = (
        (MALE, "Male"),
        (FEMALE, "Female"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE)
    view = models.IntegerField(default=0)
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, null=True, blank=True)
    images = models.ManyToManyField(Image, related_name="ProductImage", blank=True)
    
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    average_rating = models.FloatField(default=0)
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICE, default=MALE)
    
    cost = models.IntegerField(default=0)
    price = models.IntegerField(default=0)
    old_price = models.IntegerField(default=0)
    
    @property
    def product_info(self):
        return ProductInfo(self.name, self.description, self.average_rating, self.category)
    
    @property
    def price_info(self):
        return Price(self.cost, self.price, self.old_price)

    def __str__(self):
        return self.name

    def update_total(self):
        products = ProductItem.objects.filter(product=self).aggregate(
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
        db_table = "product"

class ProductItem(TimeBase, Statistics):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="sizes")
    size = models.CharField(max_length=255, null=True, blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.product.update_total()
        self.product.save()

    def __str__(self):
        return f"{self.product.name}, {self.size}"

    class Meta:
        db_table = "product_item"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    primary = models.BooleanField(default=False)

    class Meta:
        db_table = "product_image" 

class Shoes(Product):
    SNEAKER = "sneaker"
    BOOTS = "boots"
    SANDALS = "sandals"
    SLIPPERS = "slippers"
    FORMAL = "formal"
    
    SHOES_CATEGORY_CHOICE = (
        (SNEAKER, "Sneaker"),
        (BOOTS, "Boots"), 
        (SANDALS, "Sandals"),
        (SLIPPERS, "Slippers"),
        (FORMAL, "Formal")
    )
    
    class Meta:
        proxy = True
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._meta.get_field('category').choices = self.SHOES_CATEGORY_CHOICE
        self._meta.get_field('category').default = self.SNEAKER

class Clothes(Product):
    SHIRT = "Shirt"
    PANTS = "Pants"
    DRESS = "Dress"
    JACKET = "Jacket"
    SWEATER = "Sweater"
    
    CLOTHES_CATEGORY_CHOICE = (
        (SHIRT, "Shirt"),
        (PANTS, "Pants"),
        (DRESS, "Dress"), 
        (JACKET, "Jacket"),
        (SWEATER, "Sweater")
    )

    class Meta:
        proxy = True
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._meta.get_field('category').choices = self.CLOTHES_CATEGORY_CHOICE
        self._meta.get_field('category').default = self.SHIRT 