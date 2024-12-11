import uuid
from django.db import models
from user.models import TimeBase

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