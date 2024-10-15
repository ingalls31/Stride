import os
from celery import Celery
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')

app = Celery('ecommerce')
app.config_from_object('django.conf:settings', namespace='CELERY')
# app.autodiscover_tasks()
app.autodiscover_tasks(['statistical'])