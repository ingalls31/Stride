# Generated by Django 4.1.6 on 2024-04-28 14:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0010_rename_money_total_agency_profit_total_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(choices=[('ship', 'Ship'), ('cancel', 'Cancel'), ('complete', 'Complete'), ('return', 'Return'), ('pending', 'Pending')], default='ship', max_length=10),
        ),
    ]
