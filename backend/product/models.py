import django.dispatch
from random import choices
from django.db import models
from user.models import TimeBase, Statistics, Customer
from image.models import Image
import uuid
from django.db.models import Sum
# Create your models here.


class ProductInfo:    
    def __init__(self, name, description, average_rating, category):
        self.name = name
        self.description = description
        self.average_rating = average_rating
        self.category = category

    def __str__(self):
        return self.name
    


class Price:
    def __init__(self, cost, price, old_price):
        self.cost = cost
        self.price = price
        self.old_price = old_price

    def __str__(self):
        return f"{self.cost}, {self.price}, {self.old_price}"


class PaymentOrder:
    def __init__(self, payment_session, payment_done):
        self.payment_session = payment_session
        self.payment_done = payment_done

    def __str__(self):
        return f"{self.payment_session}, {self.payment_done}"



class ShippingAddress:
    def __init__(self, receiver, phone, address):
        self.receiver = receiver
        self.phone = phone
        self.address = address

    def __str__(self):
        return f"{self.receiver}, {self.phone}, {self.address}"
        


class ReviewInfo:
    def __init__(self, comment, reply, rate_point):
        self.comment = comment
        self.reply = reply
        self.rate_point = rate_point

    def __str__(self):
        return f"{self.comment}, {self.reply}, {self.rate_point}"

    class Meta:
        abstract = True


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


class Address(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    city = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    postal_code = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.city}, {self.address}, {self.region}, {self.postal_code}"

    class Meta:
        db_table = "address"


class Warehouse(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.ForeignKey(Address, on_delete=models.CASCADE)

    class Meta:
        db_table = "warehouse"


class Product(TimeBase, Statistics):
    MALE = "male"
    FEMALE = "female"
    CATEGORY_CHOICE = (
        (MALE, "Male"),
        (FEMALE, "Female"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agency = models.ForeignKey(Agency, on_delete=models.CASCADE)
    # discount = models.FloatField(default=0)
    view = models.IntegerField(default=0)
    warehouse = models.ForeignKey(
        Warehouse, on_delete=models.CASCADE, null=True, blank=True
    )
    images = models.ManyToManyField(Image, related_name="ProductImage", blank=True)
    
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    average_rating = models.FloatField(default=0)
    category = models.CharField(max_length=10, choices=CATEGORY_CHOICE, default=MALE)
    
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


class Order(TimeBase, ShippingAddress):
    CREATING = "creating"
    PENDING = "pending"
    SHIP = "ship"
    CANCEL = "cancel"
    COMPLETE = "complete"
    RETURN = "return"
    STATUS_CHOICE = (
        (CREATING, "Creating"),
        (SHIP, "Ship"),
        (CANCEL, "Cancel"),
        (COMPLETE, "Complete"),
        (RETURN, "Return"),
        (PENDING, "Pending"),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True)

    total_price = models.IntegerField(default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICE, default=SHIP)
    products = models.ManyToManyField(
        ProductItem, related_name="OrderProduct", blank=True
    )

    payment_session = models.CharField(max_length=255, null=True, blank=True)
    payment_done = models.BooleanField(default=False)
    
    receiver = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=100, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    
    @property
    def payment_info(self):
        return PaymentOrder(self.payment_session, self.payment_done)
    
    @property
    def shipping_info(self):
        return ShippingAddress(self.receiver, self.phone, self.address)

    def __str__(self):
        return f"{self.customer.user.first_name} {self.customer.user.last_name} ({self.address})"

    class Meta:
        db_table = "order"


class Cart(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    productItem = models.ForeignKey(
        ProductItem, on_delete=models.CASCADE, blank=True, null=True
    )
    quantity = models.IntegerField(default=1)

    class Meta:
        db_table = "cart"



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


class Review(TimeBase, ReviewInfo):
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
