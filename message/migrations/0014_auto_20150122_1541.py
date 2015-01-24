# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0013_profile_stripe_customer_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='stripe_customer_id',
            field=models.CharField(default=None, max_length=120, null=True, blank=True),
            preserve_default=True,
        ),
    ]
