# Generated by Django 4.1.6 on 2024-12-12 15:07

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import inventory.models.campaign
import inventory.models.promotion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0038_clothes_shoes_alter_product_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='Campaign',
            fields=[
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('total', models.BigIntegerField(default=0)),
                ('buyed_total', models.BigIntegerField(default=0)),
                ('cancelled_total', models.BigIntegerField(default=0)),
                ('returned_total', models.BigIntegerField(default=0)),
                ('pending_total', models.BigIntegerField(default=0)),
                ('ship_total', models.BigIntegerField(default=0)),
                ('revenue_total', models.BigIntegerField(default=0)),
                ('profit_total', models.BigIntegerField(default=0)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('status', models.CharField(choices=[('pending', 'pending'), ('running', 'running'), ('close', 'close')], default='pending', max_length=10)),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('discount', models.IntegerField(default=0, help_text='Enter a value from 0 to 100 to set the discount percentage.', validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('discount_code', models.CharField(blank=True, default=inventory.models.campaign.generate_discount_code, max_length=6, null=True)),
                ('orders', models.ManyToManyField(blank=True, related_name='CampaignOrder', to='inventory.order')),
            ],
            options={
                'db_table': 'campaign',
            },
        ),
        migrations.CreateModel(
            name='Promotion',
            fields=[
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.IntegerField()),
                ('type', models.CharField(choices=[('flash_deal', 'Flash Deal'), ('product_discount', 'Product Discount')], default='product_discount', max_length=255)),
                ('discount', models.IntegerField(default=0, help_text='Enter a value from 0 to 100 to set the discount percentage.', validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('discount_code', models.CharField(blank=True, default=inventory.models.promotion.generate_discount_code, max_length=6, null=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.product')),
            ],
            options={
                'db_table': 'promotion',
            },
        ),
        migrations.CreateModel(
            name='CampaignPromotion',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.campaign')),
                ('promotion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.promotion')),
            ],
            options={
                'db_table': 'campaign_promotion',
            },
        ),
        migrations.CreateModel(
            name='CampaignOrder',
            fields=[
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('campaign', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.campaign')),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='inventory.order')),
                ('promotions', models.ManyToManyField(blank=True, related_name='CampaignPromotion', to='inventory.promotion')),
            ],
            options={
                'db_table': 'campaign_order',
            },
        ),
    ]