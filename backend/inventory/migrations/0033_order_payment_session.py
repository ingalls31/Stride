# Generated by Django 4.1.6 on 2024-06-14 21:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0032_review_reply'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='payment_session',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
