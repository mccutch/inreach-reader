# Generated by Django 3.1.2 on 2020-10-07 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail_parser', '0007_auto_20201007_0118'),
    ]

    operations = [
        migrations.AddField(
            model_name='trip',
            name='instructions',
            field=models.TextField(default='None'),
        ),
    ]
