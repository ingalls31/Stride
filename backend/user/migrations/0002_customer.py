# Generated by Django 4.1.6 on 2024-04-12 16:31

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('image', '0002_alter_image_image'),
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('buyed_total', models.IntegerField(default=0)),
                ('ship_total', models.IntegerField(default=0)),
                ('selected_total', models.IntegerField(default=0)),
                ('cancelled_total', models.IntegerField(default=0)),
                ('returned_total', models.IntegerField(default=0)),
                ('money_total', models.IntegerField(default=0)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('phone_number', models.CharField(max_length=10)),
                ('address', models.TextField(blank=True, null=True)),
                ('avatar', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='avatar', to='image.image')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'abstract': False,
            },
        ),
    ]