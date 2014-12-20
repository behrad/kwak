# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User

import broadcast

class Profile(models.Model):

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    user = models.OneToOneField(User, related_name='profile')
    email = models.EmailField('email')
    name = models.CharField('name', max_length=120)

    def __unicode__(self):
        return self.name

class Team(models.Model):

    class Meta:
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'

    members = models.ManyToManyField(Profile, null=True, blank=True, related_name='team_channels')
    name = models.CharField('name', max_length=120)

    def __unicode__(self):
        return self.name


class Channel(models.Model):

    class Meta:
        verbose_name = 'Channel'
        verbose_name_plural = 'Channels'

    name = models.CharField('name', max_length=120)
    color = models.CharField('color', max_length=3)
    team = models.ForeignKey(Team, related_name='team_channels')
    readers = models.ManyToManyField(Profile, null=True, blank=True, related_name='reading')

    def subscribed(self):
        pass

    def __unicode__(self):
        return self.name


class Topic(models.Model):

    class Meta:
        verbose_name = 'Topic'
        verbose_name_plural = 'Topics'

    title = models.CharField('title', max_length=120)
    channel = models.ForeignKey(Channel, related_name='topics')

    def team(self):
        return self.channel.team

    def __unicode__(self):
        return self.title


class Message(models.Model):

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    pubdate = models.DateTimeField('pubdate', auto_now_add=True, editable=False)
    author = models.ForeignKey(Profile, related_name='messages')
    topic = models.ForeignKey(Topic, related_name='messages')
    seen_by = models.ManyToManyField(Profile, null=True, blank=True, related_name='saw_message')

    content = models.TextField(null=True, blank=True)

    def channel(self):
        return self.topic.channel

    def team(self):
        return self.topic.channel.team

    def __unicode__(self):
        return "{} - {}".format(self.author.name, self.content[0:10])


from django.db.models.signals import post_save
from django.contrib.auth.models import User

def create_profile(sender, **kw):
    user = kw["instance"]
    if kw["created"]:
        profile = Profile(user=user)
        profile.email = user.email
        profile.name = "{} {}".format(user.first_name, user.last_name)
        profile.save()
post_save.connect(create_profile, sender=User, dispatch_uid="users-profilecreation-signal")

import requests
def broadcast_message(sender, **kw):
    message = kw["instance"]
    payload = {
        'id': message.id,
        'pubdate': message.pubdate,
        'content': message.content,
        'author': message.author.id,
        'topic': message.topic.id,
    }
    r = requests.post('http://localhost:8080/message', data=payload)
post_save.connect(broadcast_message, sender=Message)


def broadcast_topic(sender, **kw):
    topic = kw["instance"]
    payload = {
        'id': topic.id,
        'title': topic.title,
        'channel': topic.channel.id,
    }
    r = requests.post('http://localhost:8080/topic', data=payload)
post_save.connect(broadcast_topic, sender=Topic)
