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
            ],
            options={
                'verbose_name': 'Message',
                'verbose_name_plural': 'Messages',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('email', models.EmailField(max_length=75, verbose_name=b'email')),
                ('name', models.CharField(max_length=120, verbose_name=b'name')),
                ('user', models.OneToOneField(related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Profile',
                'verbose_name_plural': 'Profiles',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Team',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=120, verbose_name=b'name')),
                ('members', models.ManyToManyField(related_name='team_channels', null=True, to='message.Profile', blank=True)),
            ],
            options={
                'verbose_name': 'Team',
                'verbose_name_plural': 'Teams',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Topic',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=120, verbose_name=b'title')),
                ('channel', models.ForeignKey(related_name='topics', to='message.Channel')),
            ],
            options={
                'verbose_name': 'Topic',
                'verbose_name_plural': 'Topics',
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='message',
            name='author',
            field=models.ForeignKey(related_name='messages', to='message.Profile'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='message',
            name='seen_by',
            field=models.ManyToManyField(related_name='saw_message', null=True, to='message.Profile', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='message',
            name='topic',
            field=models.ForeignKey(related_name='messages', to='message.Topic'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='channel',
            name='readers',
            field=models.ManyToManyField(related_name='reading', null=True, to='message.Profile', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='channel',
            name='team',
            field=models.ForeignKey(related_name='team_channels', to='message.Team'),
            preserve_default=True,
        ),
    ]
