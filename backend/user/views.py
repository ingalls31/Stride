import logging
import os
from datetime import datetime

from django.core.cache import cache
from django.db.models import Q
from django.utils import timezone
from django.utils.timezone import get_current_timezone
from rest_framework import filters, generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, NotFound
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from .permissions import IsStaffOrAdmin, IsActiveUser
from ecommerce.pagination import StandardPageNumberPagination
from .serializers import CustomerSerializer, NotificationSerializer
from .models import Customer, Notification

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

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsActiveUser]
    
    def get_queryset(self):
        return Notification.objects.filter(
            customer__user=self.request.user
        ).select_related('content').order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_seen = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(
            {
                "success": True,
                "message": "Notification marked as read",
                "data": serializer.data
            }
        )
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        notifications = self.get_queryset()
        notifications.update(is_seen=True)
        return Response(
            {
                "success": True,
                "message": "All notifications marked as read"
            },
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        notification = self.get_object()
        notification.delete()
        return Response(
            {
                "success": True,
                "message": "Notification deleted successfully"
            },
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_seen=False).count()
        return Response(
            {
                "success": True,
                "message": "Unread notification count retrieved",
                "data": {"count": count}
            },
            status=status.HTTP_200_OK
        )
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "success": True,
                "message": "Notifications retrieved successfully",
                "data": serializer.data
            },
            status=status.HTTP_200_OK
        )