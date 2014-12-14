# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('message', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='messageseen',
            name='message',
        ),
        migrations.RemoveField(
            model_name='messageseen',
            name='user',
        ),
        migrations.DeleteModel(
            name='MessageSeen',
        ),
        migrations.AddField(
            model_name='message',
            name='seen_by',
            field=models.ManyToManyField(related_name='saw_message', to=settings.AUTH_USER_MODEL),
            preserve_default=True,
        ),
    ]
