# Generated by Django 4.1.6 on 2024-06-11 13:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0011_alter_customer_buyed_total_and_more'),
        ('product', '0028_rename_content_rating_comment'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Rating',
            new_name='Review',
        ),
    ]