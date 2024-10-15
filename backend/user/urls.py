from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    CustomerViewSet
)
router = DefaultRouter()
router.register(r"customers", CustomerViewSet, basename="customers")
urlpatterns = [
    path("", include(router.urls))
]
