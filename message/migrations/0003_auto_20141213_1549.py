# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0002_auto_20141212_1559'),
    ]

    operations = [
        migrations.AlterField(
            model_name='topic',
            name='channel',
            field=models.ForeignKey(related_name='topics', to='message.Channel'),
            preserve_default=True,
        ),
    ]
