from django_filters import rest_framework as filters
from .models import *


class ProductFilter(filters.FilterSet):
    name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    min_price = filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = filters.NumberFilter(field_name="price", lookup_expr='lte')
    average_rating = filters.NumberFilter(field_name="average_rating", lookup_expr='gte')
    agency = filters.CharFilter(field_name="agency__name", lookup_expr='icontains')
    class Meta:
        model = Product
        fields = ['name', 'price', 'average_rating', 'agency']
        
class OrderFilter(filters.FilterSet):
    class Meta:
        model = Order
        fields = ['status']
        
class ReviewFilter(filters.FilterSet):
    product = filters.CharFilter(field_name="order_product__productItem__product__id", lookup_expr='icontains')
    class Meta:
        model = Review
        fields = ['product']