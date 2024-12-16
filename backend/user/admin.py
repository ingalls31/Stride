from django.contrib import admin

from ecommerce import settings
from django.utils.html import format_html
from django import forms
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.contrib.auth.models import Permission
from django.contrib.auth.models import Group
from social_django.models import Association, Nonce, UserSocialAuth
from .models import Customer, Notification, NotificationContent, Statistical, User

admin.site.unregister((Group, Association, Nonce, UserSocialAuth))


class UserAdminForm(forms.ModelForm):
    user_permissions = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        widget=FilteredSelectMultiple("Permissions", is_stacked=False),
        required=False,
    )

    class Meta:
        model = User
        fields = "__all__"


class CustomerInline(admin.StackedInline):
    model = Customer
    can_delete = False
    verbose_name_plural = "customer"
    fk_name = "user"

    list_display = ("user", "phone_number", "address", "date_of_birth")
    fieldsets = (
        (
            "Statistics",
            {
                "fields": (
                    (
                        "buyed_total",
                        "ship_total",
                        "cancelled_total",
                        "returned_total",
                        "revenue_total",
                        "profit_total",
                    ),
                )
            },
        ),
        (
            "Information",
            {
                "fields": (
                    ("user",),
                    ("avatar",),
                    ("image",),
                    ("phone_number",),
                    ("address",),
                    ("date_of_birth",),
                )
            },
        ),
        # ('TimeBase', {'fields': (('created_at', 'updated_at'),)}),
    )
    readonly_fields = (
        "created_at",
        "updated_at",
        "pending_total",
        "buyed_total",
        "ship_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
        "image",
    )

    def image(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" width="150" height="auto"/>',
                f"{obj.avatar.image.url}",
            )
        return ""


class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    inlines = [
        CustomerInline,
    ]
    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_superuser",
        "pending_total",
        "buyed_total",
        "ship_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )
    fieldsets = (
        (
            "Account",
            {
                "fields": (
                    ("email",),
                    (
                        "first_name",
                        "last_name",
                    ),
                    (
                        "is_active",
                        "is_staff",
                        "is_superuser",
                    ),
                    ("user_permissions",),
                )
            },
        ),
        # ('TimeBase', {'fields': (('created_at', 'updated_at'),)}),
    )
    readonly_fields = ("created_at", "updated_at")
    search_fields = ("email", "first_name", "last_name")

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


class StatisticalAdmin(admin.ModelAdmin):
    fieldsets = (
        (
            "Total",
            {
                "fields": (
                    (
                        "total",
                        "buyed_total",
                        "ship_total",
                        "pending_total",
                        "cancelled_total",
                        "returned_total",
                    ),
                ),
            },
        ),
        (
            "Revenue",
            {
                "fields": (("revenue_total", "profit_total"),),
            },
        ),
    )
    readonly_fields = (
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )
    list_display = (
        "total",
        "buyed_total",
        "ship_total",
        "pending_total",
        "cancelled_total",
        "returned_total",
        "revenue_total",
        "profit_total",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class NotificationAdminForm(forms.ModelForm):
    content_text = forms.CharField(
        widget=forms.Textarea(attrs={"rows": 4}), required=False
    )

    class Meta:
        model = Notification
        fields = ["customer", "is_seen"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.content:
            self.fields["content_text"].initial = self.instance.content.content

    def save(self, commit=True):
        notification = super().save(commit=False)
        content_text = self.cleaned_data.get("content_text")

        if content_text:
            if notification.content:
                notification.content.content = content_text
                notification.content.save()
            else:
                content = NotificationContent.objects.create(content=content_text)
                notification.content = content

        if commit:
            notification.save()
        return notification


class NotificationAdmin(admin.ModelAdmin):
    form = NotificationAdminForm
    list_display = ("customer", "content_display", "is_seen", "created_at")
    list_filter = ("is_seen", "created_at")
    search_fields = (
        "customer__user__email",
        "customer__user__first_name",
        "customer__user__last_name",
        "content__content",
    )
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            "Notification Information",
            {
                "fields": (
                    "customer",
                    "content_text",
                    "is_seen",
                )
            },
        ),
        ("Timestamps", {"fields": (("created_at", "updated_at"),)}),
    )

    def content_display(self, obj):
        return obj.content.content if obj.content else "-"

    content_display.short_description = "Content"


admin.site.register(User, UserAdmin)
admin.site.register(Statistical, StatisticalAdmin)
admin.site.register(Notification, NotificationAdmin)
