import uuid
from django.db import models
from user.models import TimeBase, Customer
from .base import ShippingAddress, PaymentOrder
from .product import ProductItem

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
    products = models.ManyToManyField(ProductItem, related_name="OrderProduct", blank=True)

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

class OrderProduct(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    productItem = models.ForeignKey(ProductItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self) -> str:
        return f"{self.productItem.product.name}, {self.productItem.size}"

    class Meta:
        db_table = "order_product"

class Cart(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    productItem = models.ForeignKey(ProductItem, on_delete=models.CASCADE, blank=True, null=True)
    quantity = models.IntegerField(default=1)

    class Meta:
        db_table = "cart" 