# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0017_subscription_profile'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='is_locked',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
