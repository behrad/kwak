# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User

class Team(models.Model):

    class Meta:
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'

    members = models.ManyToManyField(User, related_name='team_channels')
    name = models.CharField('name', max_length=120)

    def __unicode__(self):
        return self.name


class Channel(models.Model):

    class Meta:
        verbose_name = 'Channel'
        verbose_name_plural = 'Channels'

    name = models.CharField('name', max_length=120)
    subscribers = models.ManyToManyField(User, related_name='subscriber_channels')
    team = models.ForeignKey(Team, related_name='team_channels')

    def __unicode__(self):
        return self.name


class Topic(models.Model):

    class Meta:
        verbose_name = 'Topic'
        verbose_name_plural = 'Topics'

    title = models.CharField('title', max_length=120)
    channel = models.ForeignKey(Channel, related_name='topics')

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


class MessageSeen(models.Model):
    class Meta:
        verbose_name = 'MessageSeen'
        verbose_name_plural = 'MessagesSeen'

    user = models.ForeignKey(User, related_name='saw_messages')
    message = models.ForeignKey(Message, related_name='seen_by_user')

    def __unicode__(self):
        return "{} has seen {}".format(self.user.username, self.message.content[0:10])
