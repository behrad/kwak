# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='channel',
            name='color',
            field=models.CharField(default='_01', max_length=3, verbose_name=b'color'),
            preserve_default=False,
        ),
    ]
