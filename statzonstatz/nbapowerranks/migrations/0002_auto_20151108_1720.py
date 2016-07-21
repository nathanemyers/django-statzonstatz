# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nbapowerranks', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='ranking',
            options={'ordering': ['year', 'week', 'rank']},
        ),
        migrations.AddField(
            model_name='team',
            name='color',
            field=models.CharField(default='black', max_length=50),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='team',
            name='division',
            field=models.CharField(default='none', max_length=100),
            preserve_default=False,
        ),
    ]
