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
        
class StatisticComplete(models.Model):
    buyed_total = models.BigIntegerField(default=0)
    cancelled_total = models.BigIntegerField(default=0)
    returned_total = models.BigIntegerField(default=0)
    
    class Meta:
        abstract = True
        
class StatisticNonComplete(models.Model):
    pending_total = models.BigIntegerField(default=0)
    ship_total = models.BigIntegerField(default=0)
    
    class Meta:
        abstract = True
        
class StatisticMoney(models.Model):
    revenue_total = models.BigIntegerField(default=0)
    profit_total = models.BigIntegerField(default=0)
    
    class Meta:
        abstract = True
        
class Statistics(StatisticComplete, StatisticNonComplete, StatisticMoney):
    total = models.BigIntegerField(default=0)
    
    class Meta:
        abstract = True

class CustomerInfo(models.Model):
    phone_number = models.CharField(max_length=10)
    address = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    class Meta:
        abstract = True
        

class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError("The given email must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)
    

class User(AbstractUser, TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    # groups = None
    email = models.EmailField("Email address", unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return f"{self.email} {self.first_name} {self.last_name}"
    
    class Meta:
        db_table = "user"
    
    
class Customer(TimeBase, Statistics, CustomerInfo):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    avatar = models.ForeignKey(Image, on_delete=models.SET_NULL, null=True, blank=True, related_name="avatar")

    
    def __str__(self) -> str:
        return f"{self.user.first_name} {self.user.last_name}"
    
    class Meta:
        db_table = "customer"
        
class NotificationContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()
    
    class Meta:
        db_table = "notification_content"
    
class Notification(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    is_seen = models.BooleanField(default=False)
    content = models.ForeignKey(NotificationContent, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self) -> str:
        return f"{self.user.first_name} {self.user.last_name}"
    
    class Meta:
        db_table = "notification"

    


    