# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0012_profile_hide_tour'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='stripe_customer_id',
            field=models.IntegerField(default=None, null=True, blank=True),
            preserve_default=True,
        ),
    ]
