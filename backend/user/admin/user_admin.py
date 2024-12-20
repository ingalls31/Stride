from django.contrib import admin
from django.contrib.auth.models import Permission
from django.contrib.admin.widgets import FilteredSelectMultiple
from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.contrib import messages
from django import forms
from django.utils.html import format_html
from user.models import Customer, User, NotificationContent, Notification


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


class BulkNotificationForm(forms.Form):
    title = forms.CharField(
        max_length=255,
        label="Title"
    )
    content = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 4}), 
        label="Content"
    )


class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    inlines = [
        CustomerInline,
    ]
    list_per_page = 20
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

    actions = ['send_bulk_notification']

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

    def send_bulk_notification(self, request, queryset):
        if 'apply' in request.POST:
            form = BulkNotificationForm(request.POST)
            if form.is_valid():
                try:
                    content_text = form.cleaned_data['content']
                    title = form.cleaned_data['title']
                    selected_customers = Customer.objects.filter(user__in=queryset)
                    
                    if not selected_customers.exists():
                        self.message_user(
                            request, 
                            "Không tìm thấy customer tương ứng với các user đã chọn", 
                            level=messages.ERROR
                        )
                        return HttpResponseRedirect(request.get_full_path())
                    
                    content = NotificationContent.objects.create(content=content_text)
                    
                    notifications = []
                    for customer in selected_customers:
                        notifications.append(
                            Notification(
                                customer=customer,
                                title=title,
                                content=content,
                                is_seen=False
                            )
                        )
                    
                    created_notifications = Notification.objects.bulk_create(notifications)
                    
                    self.message_user(
                        request,
                        f"Đã gửi thông báo thành công tới {len(created_notifications)} người dùng",
                        level=messages.SUCCESS
                    )
                    return HttpResponseRedirect("../")
                except Exception as e:
                    self.message_user(
                        request,
                        f"Có lỗi xảy ra khi gửi thông báo: {str(e)}",
                        level=messages.ERROR
                    )
                    return HttpResponseRedirect(request.get_full_path())
        
        form = BulkNotificationForm()
        context = {
            'title': 'Send Bulk Notification',
            'form': form,
            'opts': self.model._meta,
            'media': self.media,
            'selected_users': queryset,
            'action': 'send_bulk_notification',
        }
        return render(request, 'admin/bulk_notification_form.html', context)

    send_bulk_notification.short_description = "Send notification to selected users"
