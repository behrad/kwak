# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0003_auto_20150108_1038'),
    ]

    operations = [
        migrations.AddField(
            model_name='team',
            name='uid',
            field=models.CharField(default=uuid.uuid4, max_length=100, null=True, blank=True),
            preserve_default=True,
        ),
    ]
