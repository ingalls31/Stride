from ast import Or
from unittest import result
from uu import Error
from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.viewsets import *
import stripe
from ecommerce.pagination import StandardPageNumberPagination
from product.filters import OrderFilter, ProductFilter, ReviewFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action

import user
from .models import *
from user.permissions import *
from .serializers import *
from rest_framework import filters
from rest_framework import status
stripe.api_key = settings.STRIPE_SECRET

# Create your views here.

class ProductViewSet(ModelViewSet):
    pagination_class = StandardPageNumberPagination
    serializer_class = ProductListSerializer
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = ProductFilter
    queryset = Product.objects.all()
    ordering_fields = ['created_at', 'buyed_total', 'price', 'view']
    ordering = ['-buyed_total']
    
    def get_permissions(self):
        match self.action:
            case 'list':
                self.permission_classes = []
            case 'retrieve':
                self.permission_classes = []
            case _:
                self.permission_classes = [IsStaffOrAdmin]
        return super().get_permissions()
    
    def get_serializer_class(self):
        match self.action:
            case 'list':
                return ProductListSerializer
            case 'retrieve':
                return ProductDetailSerializer
            case _:
                return ProductDetailSerializer

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        return serializer_class(*args, **kwargs)
    
    def retrieve(self, request, *args, **kwargs):
        product = Product.objects.get(id=kwargs.get('pk'))
        product.view += 1
        product.save()
        return super().retrieve(request, *args, **kwargs)
    
class AgencyViewSet(ModelViewSet):
    pagination_class = StandardPageNumberPagination
    serializer_class = AgencySerializer
    queryset = Agency.objects.all()
    def get_permissions(self):
        match self.action:
            case 'list':
                self.permission_classes = []
            case _:
                self.permission_classes = [IsStaffOrAdmin]
        return super().get_permissions()

class CartViewSet(ModelViewSet):
    pagination_class = StandardPageNumberPagination
    permission_classes = [IsActiveUser]
    serializer_class = CartSerializer
    # queryset = Cart.objects.all()
    
    def get_serializer_class(self):
        match self.action:
            case 'list':
                return CartListSerializer
            case 'create':
                return CartPostSerializer
            case _:
                return CartSerializer
    
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        return serializer_class(*args, **kwargs)
    
    def get_queryset(self):
        try:
            print('self.request.customer', self.request.customer);
            return Cart.objects.filter(user=self.request.customer)
        except:
            return []
    
    def create(self, request, *args, **kwargs):
        
        productItemId = request.data.get('productItem')
        productItem = ProductItem.objects.get(id=productItemId)
        
        try: 
            Cart.objects.get_or_create(
                user=request.customer, 
                productItem=productItem
            )
            return Response({
                'success': True,
            }, status=status.HTTP_200_OK)
            
        except Error as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
            

class OrderViewSet(ModelViewSet):
    pagination_class = StandardPageNumberPagination
    serializer_class = OrderSerializer
    permission_classes = [IsActiveUser]
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = OrderFilter
    ordering_fields = ['updated_at']
    ordering = ['-updated_at']
    
    def get_serializer_class(self):
        match self.action:
            case 'list':
                return OrderDetailSerializer
            case 'retrieve':
                return OrderDetailSerializer
            case 'create':
                return OrderCreateSerializer
            case 'partial_update':
                return OrderSerializer
            case _:
                return OrderSerializer
    
    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        return serializer_class(*args, **kwargs)
    
    def get_queryset(self):
        try:
            return Order.objects.filter(user=self.request.customer)
        except: 
            return None
        
    def retrieve(self, request, *args, **kwargs):
        order = Order.objects.get(id=kwargs.get('pk'))
        if order.payment_session != None:
            session = stripe.checkout.Session.retrieve(order.payment_session)
            if session.status == 'complete':
                order.payment_done = True
                order.save()
        return super().retrieve(request, *args, **kwargs)
        
    def create(self, request, *args, **kwargs):
        try:
            total_price = request.data.get('total_price')
            products = request.data.get('products')
            customer = request.customer
            receiver = request.user.first_name + ' ' + request.user.last_name
            phone = customer.phone_number
            address = customer.address
            status_order = request.data.get('status')
            
            order = Order.objects.create(
                user = customer, 
                receiver = receiver,
                phone = phone,
                address = address,
                total_price = total_price,
                status = status_order
            )
            
            for product in products:
                productItem = ProductItem.objects.get(id=product['productItem'])
                OrderProduct.objects.create(
                    order = order,
                    productItem = productItem,
                    quantity = product['quantity']
                )
                
            results = OrderDetailSerializer(order).data    
            
            return Response(results, status=status.HTTP_200_OK)
            
        except Error as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, *args, **kwargs):
        try:
            order = Order.objects.get(id=kwargs.get('pk'))
            total_price = request.data.get('total_price')
            receiver = request.data.get('receiver')
            phone = request.data.get('phone')
            address = request.data.get('address')
            status_order = request.data.get('status')
            products = request.data.get('products')
            
            order.total_price = total_price
            order.receiver = receiver
            order.phone = phone
            order.address = address
            order.status = status_order
            order.save()
            
            for  product in products:
                productItem = ProductItem.objects.get(id=product['id'])
                order_product = OrderProduct.objects.filter(
                    order = order,
                    productItem = productItem
                ).first()
                
                order_product.quantity = product['quantity']
                order_product.save()
            
            result = OrderDetailSerializer(order).data

            return Response(result, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': False,
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(detail=True, methods=['get'], url_path='create-checkout-session')
    def create_checkout_session(self, request, *args, **kwargs):
        try:
            order = Order.objects.get(id=kwargs.get('pk'))
            order_product_list = OrderProduct.objects.filter(order=order)
            line_items = []
            for order_product in order_product_list:
                line_item = {
                    'price_data': {
                        'currency': 'vnd',
                        'product_data': {
                            'name': order_product.productItem.product.name
                        },
                        'unit_amount': order_product.productItem.product.price,
                    }, 
                    'quantity': order_product.quantity
                }
                line_items.append(line_item)
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                success_url=f'https://localhost:3000/order/{order.id}',
                cancel_url=f'https://localhost:3000/order/{order.id}',
            )
            order = Order.objects.get(id=kwargs.get('pk'))
            order.payment_session = session.id
            order.save()
            return Response({
                'session_id': session.id
            }, status=status.HTTP_200_OK)
        except Error as e:
            print(str(e))
            return Response({
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)
            
        
class ReviewViewSet(ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = []
    filter_backends = (DjangoFilterBackend, OrderingFilter)
    filterset_class = ReviewFilter
    queryset = Review.objects.all()
    ordering = ['-created_at']

        
    def get_serializer_class(self):
        match self.action:
            case 'create':
                return ReviewCreateSerializer
            case 'list':
                return ReviewListSerializer
            case _:
                return ReviewSerializer

    def create(self, request, *args, **kwargs):
        try:
            order_product = OrderProduct.objects.get(id=request.data.get('order_product'))
            user = request.customer
            comment = request.data.get('comment')
            rate_point = request.data.get('rate_point')
            
            Review.objects.create(
                order_product = order_product,
                user = user,
                rate_point = rate_point,
                comment = comment
            )
            
            return Response({
                'success': True,
            }, status=status.HTTP_200_OK)
            
        except Error as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
# class CommentViewSet(ModelViewSet):
#     serializer_class = CommentSerializer
#     permission_classes = [IsActiveUser]
    
#     def get_queryset(self):
#         try:
#             return Comment.objects.filter(user=self.request.customer)
#         except: 
#             return None
    
