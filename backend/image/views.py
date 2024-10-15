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
from user.permissions import IsStaffOrAdmin, IsActiveUser
from ecommerce.pagination import StandardPageNumberPagination
from .serializers import ImageSerializer
from .models import Image
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class ImageViewSet(ModelViewSet):
    permission_classes = [IsActiveUser]
    parser_classes = (MultiPartParser,)
    serializer_class = ImageSerializer
    pagination_class = StandardPageNumberPagination
    queryset = Image.objects.all()