# Generated by Django 4.1.6 on 2024-06-11 14:30

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0011_alter_customer_buyed_total_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={},
        ),
        migrations.AlterModelTable(
            name='customer',
            table='customer',
        ),
        migrations.AlterModelTable(
            name='user',
            table='user',
        ),
    ]
