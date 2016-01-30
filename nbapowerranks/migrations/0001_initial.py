# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=200)),
            ],
        ),
        migrations.CreateModel(
            name='Ranking',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('year', models.IntegerField()),
                ('week', models.IntegerField()),
                ('rank', models.IntegerField()),
                ('summary', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('region', models.CharField(max_length=200)),
                ('name', models.CharField(max_length=200)),
                ('conference', models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name='ranking',
            name='team',
            field=models.ForeignKey(to='nbapowerranks.Team'),
        ),
        migrations.AddField(
            model_name='player',
            name='team',
            field=models.ForeignKey(to='nbapowerranks.Team'),
        ),
    ]
