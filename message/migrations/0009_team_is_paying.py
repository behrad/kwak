# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0008_auto_20150113_1342'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='is_paying',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
