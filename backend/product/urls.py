from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import *
router = DefaultRouter()
router.register(r"products", ProductViewSet, basename="products")
router.register(r"agency", AgencyViewSet, basename="agency")
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"order", OrderViewSet, basename="order")
router.register(r"rating", ReviewViewSet, basename="rating")
# router.register(r"comment", CommentViewSet, basename="comment")


urlpatterns = [
    path("", include(router.urls))
]
