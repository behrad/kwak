# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0014_auto_20150122_1541'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='paid_for_users',
            field=models.IntegerField(default=5),
            preserve_default=True,
        ),
    ]
