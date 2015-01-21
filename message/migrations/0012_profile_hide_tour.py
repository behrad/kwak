# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0011_auto_20150120_1407'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='hide_tour',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
