from .user_admin import UserAdmin
from .statistical_admin import StatisticalAdmin
from .notification_admin import NotificationAdmin

from django.contrib.auth.models import Group
from social_django.models import Association, Nonce, UserSocialAuth

from django.contrib import admin
from user.models import User, Statistical, Notification

# Register our models
admin.site.unregister((Group, Association, Nonce, UserSocialAuth))
admin.site.register(User, UserAdmin)
admin.site.register(Statistical, StatisticalAdmin)
admin.site.register(Notification, NotificationAdmin)
