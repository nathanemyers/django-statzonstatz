# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nbapowerranks', '0002_auto_20151108_1720'),
    ]

    operations = [
        migrations.AddField(
            model_name='ranking',
            name='record',
            field=models.CharField(default=b'-', max_length=20),
        ),
    ]
