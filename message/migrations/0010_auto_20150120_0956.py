# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0009_team_is_paying'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='profile',
            name='cursor',
        ),
        migrations.AddField(
            model_name='profile',
            name='email_on_mention',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='profile',
            name='email_on_pm',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='team',
            name='users_can_change_names',
            field=models.BooleanField(default=False),
            preserve_default=True,
        ),
    ]
