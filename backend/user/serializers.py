import json
import logging
import os
import uuid

import requests
from django.db import transaction
from django.db.models.signals import post_save
from rest_framework import serializers
from rest_framework.exceptions import APIException
from .models import Customer, User, Notification, NotificationContent
from ecommerce import settings

class CustomerSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")
    password = serializers.CharField(source="user.password", write_only=True, max_length=128)
    first_name = serializers.CharField(source="user.first_name", max_length=255, required=False)
    last_name = serializers.CharField(source="user.last_name", max_length=255, required=False)
    is_superuser = serializers.BooleanField(source="user.is_superuser", read_only=True)
    phone_number = serializers.CharField(required=False)
    avatar_url = serializers.ImageField(source="avatar.image", max_length=None, allow_empty_file=True, required=False, use_url=True)
    new_password = serializers.CharField(write_only=True, max_length=128, required=False)
    class Meta:
        model = Customer
        fields = [
            "id",
            "email",
            "password",
            "new_password",
            "first_name",
            "last_name",
            'address',
            'phone_number',
            'date_of_birth',
            'avatar',
            'avatar_url',
            'is_superuser',
        ]
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        new_password = validated_data.pop('new_password', None)
        password = user_data.pop('password', None)
        user_instance = instance.user
        
        if new_password and password and user_instance.check_password(password):
            user_instance.set_password(new_password)

        # Update the User model fields
        for attr, value in user_data.items():
            setattr(user_instance, attr, value)  
        user_instance.save()

        # Update the Customer model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
    
    def create(self, validated_data):
        
        user_data = validated_data.pop('user', {})
        user = User.objects.create_user(
            email = user_data['email'], 
            password = user_data['password']
        )
        
        customer = Customer.objects.create(
            user = user
        )
        
        return customer

class NotificationSerializer(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'content', 'is_seen', 'created_at']
    
    def get_content(self, obj):
        return obj.content.content if obj.content else None
