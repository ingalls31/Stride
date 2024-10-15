import logging
import os
from datetime import datetime

from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from django.utils.timezone import get_current_timezone
from rest_framework import filters, generics, status
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from .permissions import IsStaffOrAdmin, IsActiveUser
from ecommerce.pagination import StandardPageNumberPagination
from .serializers import CustomerSerializer
from .models import Customer

class CustomerViewSet(ModelViewSet):
    serializer_class = CustomerSerializer
    pagination_class = StandardPageNumberPagination
    filter_backends = [filters.SearchFilter]
    search_fields = [
        "user__first_name",
        "user__last_name",
        "user__email",
        "user__active",
    ]
    ordering_fields = ["active", "user__date_joined"]
    
    def get_queryset(self):
        return Customer.objects.filter(user=self.request.user)
    
    def get_permissions(self):
        match self.action:
            case 'create':
                self.permission_classes = []
            case _:
                self.permission_classes = [IsActiveUser]
        return super().get_permissions()