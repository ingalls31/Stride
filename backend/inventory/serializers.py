from django.urls import include
from pkg_resources import require
from rest_framework import serializers
import stripe

from ecommerce import settings
from .models import (
    Agency,
    Cart,
    Order,
    Product,
    ProductItem,
    ProductImage,
    Review,
    OrderProduct,
)

stripe.api_key = settings.STRIPE_SECRET

# Create your tests here.


class AgencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Agency
        fields = ["name"]


class CartPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ["id", "productItem"]


class CartListSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "product",
            "quantity",
        ]

    def get_product(self, obj):
        product = obj.productItem.product
        image_obj = ProductImage.objects.get(product=product, primary=True)
        image = f"{settings.HOST}{image_obj.image.image.url}"
        return {
            "productItem": obj.productItem.id,
            "id": product.id,
            "size": obj.productItem.size,
            "name": product.name,
            "price": product.price,
            "old_price": product.old_price,
            "total": product.total,
            "image": image,
            "agency": product.agency.name,
        }


class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = "__all__"


class ProductListSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "old_price",
            "buyed_total",
            "average_rating",
            "view",
            "image_url",
        ]

    def get_image_url(self, obj):
        primary_image = ProductImage.objects.get(product=obj, primary=True)
        return f"{settings.HOST}{primary_image.image.image.url}"


class ProductDetailSerializer(serializers.ModelSerializer):
    agency = AgencySerializer(read_only=True)
    image_list = serializers.SerializerMethodField()
    item = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "old_price",
            "view",
            "description",
            "average_rating",
            "agency",
            "image_list",
            "buyed_total",
            "total",
            "item",
        ]

    def get_image_list(self, obj):
        request = self.context
        print("request", request)
        images = ProductImage.objects.filter(product=obj)
        image_list = []
        for image in images:
            image_list.append(
                {
                    "image": f"{settings.HOST}{image.image.image.url}",
                    "primary": image.primary,
                }
            )
        return image_list

    def get_item(self, obj):
        items = ProductItem.objects.filter(product=obj)
        results = []
        for item in items:
            results.append({"id": item.id, "size": item.size, "total": item.total})
        return results


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = "__all__"


class OrderProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderProduct
        fields = ["productItem", "quantity"]


class OrderCreateSerializer(serializers.ModelSerializer):
    products = OrderProductSerializer(many=True)

    class Meta:
        model = Order
        fields = ["products", "total_price", "status"]


class OrderDetailSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "receiver",
            "phone",
            "address",
            "total_price",
            "status",
            "products",
            "payment_done",
        ]

    def get_products(self, obj):
        order_product_list = OrderProduct.objects.filter(order=obj)
        customer = obj.customer
        results = []

        for item in order_product_list:
            product = item.productItem.product
            image_obj = ProductImage.objects.get(product=product, primary=True)
            image = f"{settings.HOST}{image_obj.image.image.url}"
            try:
                review = Review.objects.get(order_product=item, customer=customer)
            except:
                review = None

            results.append(
                {
                    "order_product_id": item.id,
                    "id": item.productItem.id,
                    "product_id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "old_price": product.old_price,
                    "total": product.total,
                    "image": image,
                    "agency": product.agency.name,
                    "size": item.productItem.size,
                    "quantity": item.quantity,
                    "comment": "" if review is None else review.comment,
                    "rate_point": 5 if review is None else review.rate_point,
                    "rated": True if review is not None else False,
                }
            )

        return results


# class CommentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Comment
#         fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = "__all__"


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        exclude = ["customer"]


class ReviewListSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    replied = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "product",
            "comment",
            "reply",
            "replied",
            "rate_point",
            "created_at",
            "updated_at",
        ]

    def get_product(self, obj):
        productItem = obj.order_product.productItem
        product = productItem.product

        customer = obj.customer
        avatar = (
            f"{settings.HOST}{customer.avatar.image.url}"
            if customer.avatar is not None
            else None
        )
        return {
            "product_name": product.name,
            "size": productItem.size,
            "avatar": avatar,
            "name": customer.user.first_name + " " + customer.user.last_name,
        }

    def get_replied(self, obj):
        if obj.reply is not None:
            return True
        else:
            return False
