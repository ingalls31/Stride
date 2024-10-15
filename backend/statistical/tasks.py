import datetime
from celery import shared_task
import pytz
from django.utils import timezone


from ecommerce import settings
from statistical.models import Campaign

@shared_task(name='ecommerce.update_campaign_status')
def update_campain_status(campaign_id):
    print("[ Start task ]")
    campaign = Campaign.objects.get(id=campaign_id)
    tz = pytz.timezone(settings.TIME_ZONE)
    time_now = timezone.now().astimezone(tz)
    if campaign.start_time <= time_now:
        status = Campaign.RUNNING
    if campaign.end_time <= time_now:
        status = Campaign.CLOSE
    campaign.status = status
    campaign.save()
    print("[ End task ]")