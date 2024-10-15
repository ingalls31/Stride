from django.contrib import admin

from ecommerce import settings
from . import models
from django.utils.html import format_html
from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth.models import Permission
from django.contrib.auth.models import Group
from social_django.models import Association, Nonce, UserSocialAuth
from .models import *

admin.site.unregister((Group, Association, Nonce, UserSocialAuth))

class UserAdminForm(forms.ModelForm):
    user_permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        widget=FilteredSelectMultiple("Permissions", is_stacked=False),
        required=False
    )

    class Meta:
        model = User
        fields = '__all__'
  
class CustomerInline(admin.StackedInline):
    model = Customer
    can_delete = False
    verbose_name_plural = 'customer'
    fk_name = 'user'

    list_display = ('user', 'phone_number', 'address', 'date_of_birth')
    fieldsets = (
        ('Statistics', {'fields': (('buyed_total', 'ship_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total'),)}),
        ('Information', {'fields': (
            ('user',),
            ('avatar',),
            ('image',),
            ('phone_number',),
            ('address',),
            ('date_of_birth',),
        )}),
        # ('TimeBase', {'fields': (('created_at', 'updated_at'),)}),
    )
    readonly_fields = ('created_at', 'updated_at','pending_total', 'buyed_total', 'ship_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total', 'image')

    def image(self, obj):
        if obj.avatar:
            return format_html('<img src="{}" width="150" height="auto"/>', f'{settings.HOST}{obj.avatar.image.url}')
        return ''  
    
    
class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    inlines = [CustomerInline, ]
    list_display = ('email', 'first_name', 'last_name','is_staff', 'is_superuser', 'pending_total', 'buyed_total', 'ship_total', 'cancelled_total', 'returned_total', 'revenue_total', 'profit_total')
    fieldsets = (
        ('Account', {'fields': (
            ('email',),
            ('first_name', 'last_name',),
            ('is_active', 'is_staff', 'is_superuser',),
            ('user_permissions', ),
        )}),
        # ('TimeBase', {'fields': (('created_at', 'updated_at'),)}),
    )
    readonly_fields = ('created_at', 'updated_at')
    search_fields = ('email', 'first_name', 'last_name')
    
    def buyed_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.buyed_total

    def ship_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.ship_total
    
    def pending_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.pending_total
    
    def cancelled_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.cancelled_total
    
    def returned_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.returned_total
    
    def revenue_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.revenue_total
    
    def profit_total(self, obj):
        customer = Customer.objects.get(user=obj)
        return customer.profit_total
    
    
    
    
admin.site.register(User, UserAdmin)