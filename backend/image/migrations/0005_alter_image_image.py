# Generated by Django 4.1.6 on 2024-12-17 13:52

from django.db import migrations, models
import image.models


class Migration(migrations.Migration):

    dependencies = [
        ('image', '0004_alter_image_table'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='image',
            field=models.ImageField(upload_to=image.models.RenameImage('')),
        ),
    ]