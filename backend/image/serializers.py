import json
import logging
import os
import uuid

import requests
from django.db import transaction
from django.db.models.signals import post_save
from rest_framework import serializers
from rest_framework.exceptions import APIException
from .models import Image
from ecommerce import settings

from rest_framework import serializers
from .models import Image

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image', 'created_at']

    def update(self, instance, validated_data):
        instance.image.delete(save=False)  # Delete the old image
        instance.image = validated_data.get('image', instance.image)
        instance.save()
        return instance


    
