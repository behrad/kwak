# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0002_profile_cursor'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pm',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('pubdate', models.DateTimeField(auto_now_add=True, verbose_name=b'pubdate')),
                ('content', models.TextField(null=True, blank=True)),
                ('author', models.ForeignKey(related_name='my_pms', to='message.Profile')),
                ('penpal', models.ForeignKey(related_name='pms_with_me', to='message.Profile')),
                ('seen_by', models.ManyToManyField(related_name='saw_pm', null=True, to='message.Profile', blank=True)),
            ],
            options={
                'verbose_name': 'Private Message',
                'verbose_name_plural': 'Private Messages',
            },
            bases=(models.Model,),
        ),
        migrations.AlterField(
            model_name='team',
            name='members',
            field=models.ManyToManyField(related_name='teams', null=True, to='message.Profile', blank=True),
            preserve_default=True,
        ),
    ]
