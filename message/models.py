# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User

class Channel(models.Model):

    class Meta:
        verbose_name = 'Channel'
        verbose_name_plural = 'Channels'

    name = models.CharField('name', max_length=120)
    subscribers = models.ManyToManyField(User, related_name='channels')

    def __unicode__(self):
        return self.name


class Topic(models.Model):

    class Meta:
        verbose_name = 'Topic'
        verbose_name_plural = 'Topics'

    title = models.CharField('title', max_length=120)
    channel = models.ForeignKey(Channel, related_name='messages')

    def __unicode__(self):
        return self.title


class Message(models.Model):

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    pubdate = models.DateTimeField('pubdate', auto_now_add=True, editable=False)
    author = models.ForeignKey(User, related_name='messages')
    topic = models.ForeignKey(Topic, related_name='messages')

    content = models.TextField(null=True, blank=True)

    def __unicode__(self):
        return "{} - {}…".format(self.author.username, self.content[0:10])
