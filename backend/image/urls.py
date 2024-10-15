from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    ImageViewSet
)
router = DefaultRouter()
router.register(r"images", ImageViewSet, basename="images")
urlpatterns = [
    path("", include(router.urls))
]
