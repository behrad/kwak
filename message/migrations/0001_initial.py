# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('channel', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pubdate', models.DateTimeField(auto_now_add=True, verbose_name=b'pubdate')),
                ('content', models.TextField(null=True, blank=True)),
                ('author', models.ForeignKey(verbose_name=b'author', to=settings.AUTH_USER_MODEL)),
                ('channel', models.ForeignKey(verbose_name=b'channel', to='channel.Channel')),
            ],
            options={
                'verbose_name': 'Message',
                'verbose_name_plural': 'Messages',
            },
            bases=(models.Model,),
        ),
    ]
