# Generated by Django 4.1.6 on 2024-05-15 15:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0011_alter_order_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='discount',
        ),
        migrations.AddField(
            model_name='product',
            name='old_price',
            field=models.IntegerField(default=0),
        ),
    ]