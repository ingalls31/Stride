# Generated by Django 4.1.6 on 2024-05-16 16:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0013_remove_cart_products_delete_cartproduct'),
    ]

    operations = [
        migrations.AddField(
            model_name='cart',
            name='productItem',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='inventory.productitem'),
        ),
        migrations.AddField(
            model_name='cart',
            name='quantity',
            field=models.IntegerField(default=1),
        ),
    ]