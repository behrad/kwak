# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User

class Channel(models.Model):

    class Meta:
        verbose_name = 'Channel'
        verbose_name_plural = 'Channels'

    name = models.CharField('name', max_length=120)
    subscribers = models.ManyToManyField(User)

    def __unicode__(self):
        return self.name
