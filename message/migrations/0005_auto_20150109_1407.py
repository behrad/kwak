# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0004_team_uid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='team',
            name='uid',
            field=models.CharField(default=uuid.uuid4, unique=True, max_length=100),
            preserve_default=True,
        ),
    ]
