# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('message', '0015_team_paid_for_users'),
    ]

    operations = [
        migrations.CreateModel(
            name='Subscription',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('subscription_id', models.CharField(max_length=120, verbose_name=b'subscription_id')),
                ('plan', models.CharField(max_length=120, verbose_name=b'plan')),
                ('status', models.CharField(max_length=120, verbose_name=b'status')),
                ('cancel_at_period_end', models.BooleanField(default=False)),
                ('same_card', models.BooleanField(default=False)),
                ('quantity', models.IntegerField(default=0)),
                ('current_period_start', models.DateTimeField(verbose_name=b'current_period_start')),
                ('current_period_end', models.DateTimeField(verbose_name=b'current_period_end')),
                ('team', models.ForeignKey(related_name='team_subscriptions', to='message.Team')),
            ],
            options={
                'verbose_name': 'Subscription',
                'verbose_name_plural': 'Subscriptions',
            },
            bases=(models.Model,),
        ),
        migrations.RemoveField(
            model_name='team',
            name='is_paying',
        ),
    ]
