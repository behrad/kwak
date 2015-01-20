# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0010_auto_20150120_0956'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='users_can_change_names',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
    ]
