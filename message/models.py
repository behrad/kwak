# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save
import requests
import re
from django.core.mail import send_mail


class Profile(models.Model):

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    user = models.OneToOneField(User, related_name='profile')
    email = models.EmailField('email')
    name = models.CharField('name', max_length=120)
    cursor = models.IntegerField(default=0)

    def __unicode__(self):
        return self.name

class Team(models.Model):

    class Meta:
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'

    members = models.ManyToManyField(Profile, null=True, blank=True, related_name='teams')
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

    def seen(self):
        return False

    def channel(self):
        return self.topic.channel

    def team(self):
        return self.topic.channel.team

    def __unicode__(self):
        return "{} - {}".format(self.author.name, self.content[0:10])


def create_profile(sender, **kw):
    user = kw["instance"]
    if kw["created"]:
        profile = Profile(user=user)
        profile.email = user.email
        profile.name = "{} {}".format(user.first_name, user.last_name)
        profile.save()
post_save.connect(create_profile, sender=User, dispatch_uid="users-profilecreation-signal")


def broadcast_message(sender, instance, **kw):
    message = instance
    payload = {
        'id': message.id,
        'pubdate': message.pubdate,
        'content': message.content,
        'author': message.author.id,
        'topic': message.topic.id,
        'channel': message.topic.channel.id,
    }
    r = requests.post('http://localhost:8080/message', data=payload)

    message_author = Profile.objects.get(pk=message.author.id)

    mentions = re.findall('@\*\*([^*]*)\*\*', message.content)
    for mention in mentions:
        try:
            mentionned = Profile.objects.get(name=mention)
            send_mail(
                'new mention on kwak',
                'Someone just mentionned you on kwak:\n\n{} wrote:\n{}\n'.format(message_author.name, '> '.join(message.content.splitlines(True))),
                'no-reply@kwak.io',
                [mentionned.email],
                fail_silently=True)
        except Profile.DoesNotExist:
            pass
post_save.connect(broadcast_message, sender=Message)


def broadcast_topic(sender, instance, **kw):
    topic = instance
    payload = {
        'id': topic.id,
        'title': topic.title,
        'channel': topic.channel.id,
    }
    r = requests.post('http://localhost:8080/topic', data=payload)
post_save.connect(broadcast_topic, sender=Topic)


def user_inactive(sender, instance, **kw):
    if instance.pk is None:
        instance.is_active = False
pre_save.connect(user_inactive, sender=User)
