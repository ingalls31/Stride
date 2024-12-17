from django.db.models import Sum
from typing import Iterable
from django import db
from django.db import models
import uuid

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin, AbstractUser
from django.contrib.auth.models import Permission
from image.models import Image
from .statistical import TimeBase, Statistics
from .user import Customer



class NotificationContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    content = models.TextField()

    class Meta:
        db_table = "notification_content"


class Notification(TimeBase):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    is_seen = models.BooleanField(default=False)
    content = models.ForeignKey(
        NotificationContent, on_delete=models.SET_NULL, null=True, blank=True
    )

    def __str__(self) -> str:
        return f"{self.user.first_name} {self.user.last_name}"

    class Meta:
        db_table = "notification"
