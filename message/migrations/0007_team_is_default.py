# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0006_profile_is_admin'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='is_default',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
