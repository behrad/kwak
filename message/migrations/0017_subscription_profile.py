# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0016_auto_20150124_1613'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='profile',
            field=models.ForeignKey(related_name='profile_subscriptions', default=1, to='message.Profile'),
            preserve_default=False,
        ),
    ]
