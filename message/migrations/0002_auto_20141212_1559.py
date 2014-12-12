# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='topic',
            name='name',
        ),
        migrations.AddField(
            model_name='topic',
            name='title',
            field=models.CharField(default='', max_length=120, verbose_name=b'title'),
            preserve_default=False,
        ),
    ]
