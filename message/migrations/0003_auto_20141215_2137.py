# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('message', '0002_auto_20141214_1044'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('user', models.OneToOneField(related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'UserProfile',
                'verbose_name_plural': 'UserProfiles',
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='channel',
            name='subscribers',
        ),
        migrations.AddField(
            model_name='channel',
            name='readers',
            field=models.ForeignKey(related_name='channels', default=1, to='message.UserProfile'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='message',
            name='author',
            field=models.ForeignKey(related_name='messages', to='message.UserProfile'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='message',
            name='seen_by',
            field=models.ManyToManyField(related_name='saw_message', to='message.UserProfile'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='team',
            name='members',
            field=models.ManyToManyField(related_name='team_channels', to='message.UserProfile'),
            preserve_default=True,
        ),
    ]
