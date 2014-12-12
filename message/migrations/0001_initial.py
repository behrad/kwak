# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Channel',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=120, verbose_name=b'name')),
                ('subscribers', models.ManyToManyField(related_name='channels', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Channel',
                'verbose_name_plural': 'Channels',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pubdate', models.DateTimeField(auto_now_add=True, verbose_name=b'pubdate')),
                ('content', models.TextField(null=True, blank=True)),
                ('author', models.ForeignKey(related_name='messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Message',
                'verbose_name_plural': 'Messages',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=120, verbose_name=b'name')),
                ('channel', models.ForeignKey(related_name='messages', to='message.Channel')),
            ],
            options={
                'verbose_name': 'Topic',
                'verbose_name_plural': 'Topics',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='message',
            name='topic',
            field=models.ForeignKey(related_name='messages', to='message.Topic'),
            preserve_default=True,
        ),
    ]
