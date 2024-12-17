from django.contrib import admin

from django import forms
from user.models.notification import Notification, NotificationContent

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


