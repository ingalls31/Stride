from random import choices
from django.db import models
from user.models import TimeBase, Statistics, Customer
from image.models import Image
import uuid
from django.db.models import Sum
# Create your models here.


class Agency(TimeBase, Statistics):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    def update_total(self):
        products = Product.objects \
        .filter(agency=self) \
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
        self.total = products['sum_total']
        self.buyed_total = products['sum_buyed_total']
        self.ship_total = products['sum_ship_total']
        self.pending_total = products['sum_pending_total']
        self.cancelled_total = products['sum_cancelled_total']
        self.returned_total = products['sum_returned_total']
        self.revenue_total = products['sum_revenue_total']
        self.profit_total = products['sum_profit_total']

    class Meta:
        db_table = "agency"

class Product(TimeBase, Statistics):
    MALE = 'male'
    FEMALE = 'female'
    CATEGORY_CHOICE =  (
        (MALE, 'Male'),
        (FEMALE, 'Female'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    cost = models.IntegerField(default=0)
    price = models.IntegerField(default=0)
    old_price = models.IntegerField(default=0)
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE)
    # discount = models.FloatField(default=0)
    view = models.IntegerField(default=0)
    description = models.TextField(null=True, blank=True)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICE, default=MALE)
    average_rating = models.FloatField(default=0) 
    images = models.ManyToManyField(
        Image, related_name="ProductImage", blank=True
    )
    # comments = models.ManyToManyField(
    #     Customer, related_name="Comment", blank=True
    # )
    
    # ratings = models.ManyToManyField(
    #     Customer, related_name="Rating", blank=True
    # )
    
    def update_total(self):
        products = ProductItem.objects \
        .filter(product=self) \
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
        self.total = products['sum_total']
        self.buyed_total = products['sum_buyed_total']
        self.ship_total = products['sum_ship_total']
        self.pending_total = products['sum_pending_total']
        self.cancelled_total = products['sum_cancelled_total']
        self.returned_total = products['sum_returned_total']
        self.revenue_total = products['sum_revenue_total']
        self.profit_total = products['sum_profit_total']
        
    class Meta:
        db_table = "product"
    
class ProductItem(TimeBase, Statistics):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sizes')
    size = models.CharField(max_length=255, null=True, blank=True)
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.product.update_total()
        self.product.save()
    class Meta:
        db_table = "product_item"

class Order(TimeBase):
    CREATING = 'creating'
    PENDING = 'pending'
    SHIP = 'ship'
    CANCEL = 'cancel'
    COMPLETE = 'complete'
    RETURN = 'return'
    STATUS_CHOICE =  (
        (CREATING, 'Creating'),
        (SHIP, 'Ship'),
        (CANCEL, 'Cancel'),
        (COMPLETE, 'Complete'),
        (RETURN, 'Return'),
        (PENDING, 'Pending'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    receiver = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=100, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    total_price = models.IntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICE, default=SHIP)
    payment_session = models.CharField(max_length=255, null=True, blank=True)
    payment_done = models.BooleanField(default=False)
    products = models.ManyToManyField(
        ProductItem, related_name="OrderProduct", blank=True
    )
    
    class Meta:
        db_table = "order"

class Cart(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    productItem = models.ForeignKey(ProductItem, on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.IntegerField(default=1)
    
    class Meta:
        db_table = "cart"
    
# class CartProduct(models.Model):
#     cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
#     productItem = models.ForeignKey(ProductItem, on_delete=models.CASCADE)
#     quantity = models.IntegerField(default=1)
    
class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    productItem = models.ForeignKey(ProductItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    
    def __str__(self) -> str:
        return f"{self.productItem.product.name}, {self.productItem.size}"
    
    class Meta:
        db_table = "order_product"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    primary = models.BooleanField(default=False)
    
    class Meta:
        db_table = "product_image"
    
class Review(TimeBase):
    RATE_CHOICES = [
        (1, 1),
        (2, 2),
        (3, 3),
        (4, 4),
        (5, 5),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # product = models.ForeignKey(Product, on_delete=models.CASCADE)
    order_product = models.ForeignKey(OrderProduct, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(Customer, on_delete=models.CASCADE)
    comment = models.TextField(null=True, blank=True)
    reply = models.TextField(null=True, blank=True)
    rate_point = models.IntegerField(choices=RATE_CHOICES, default=5)
    # images = models.ManyToManyField(
    #     Image, related_name="CommentImage", blank=True
    # )
    
    class Meta:
        db_table = "review"
    
    
# class CommentImage(models.Model):
#     comment = models.ForeignKey(Comment, on_delete=models.CASCADE)
#     image = models.ForeignKey(Image, on_delete=models.CASCADE)

# class Rating(TimeBase):
#     RATE_CHOICES = [
#         (1, 1),
#         (2, 2),
#         (3, 3),
#         (4, 4),
#         (5, 5),
#     ]
#     user = models.ForeignKey(Customer, on_delete=models.CASCADE)
#     # product = models.ForeignKey(Product, on_delete=models.CASCADE)
#     order_product = models.ForeignKey(OrderProduct, on_delete=models.CASCADE, null=True, blank=True)
#     rate_point = models.IntegerField(choices=RATE_CHOICES, default=5)
    
    
