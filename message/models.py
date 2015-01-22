# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import pre_save, post_save
import requests
import re
from django.core.mail import send_mail
from uuid import uuid4
import urllib


class Profile(models.Model):

    class Meta:
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'

    user = models.OneToOneField(User, related_name='profile')
    email = models.EmailField('email')
    name = models.CharField('name', max_length=120)
    is_admin = models.BooleanField(default=False)
    email_on_mention = models.BooleanField(default=True)
    email_on_pm = models.BooleanField(default=True)
    hide_tour = models.BooleanField(default=False)
    stripe_customer_id = models.CharField(default=None, blank=True, null=True, max_length=120)

    def is_active(self):
        return self.user.is_active

    def __unicode__(self):
        return self.name


class Team(models.Model):

    class Meta:
        verbose_name = 'Team'
        verbose_name_plural = 'Teams'

    members = models.ManyToManyField(Profile, null=True, blank=True, related_name='teams')
    name = models.CharField('name', max_length=120)
    uid = models.CharField(max_length=100, unique=True, default=uuid4)
    users_can_change_names = models.BooleanField(default=True)

    is_paying = models.BooleanField(default=False)
    paid_for_users = models.IntegerField(default=5)

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
    is_default = models.BooleanField(default=False)

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

    def get_thread_url(self):
        return u'https://kwak.io/channels/{}/{}/{}/{}'.format(
            self.topic.channel.id,
            urllib.quote_plus(self.topic.channel.name),
            self.topic.id,
            urllib.quote_plus(self.topic.title)
        )

    def __unicode__(self):
        return u"{} - {}".format(self.author.name, self.content[0:10])

class Pm(models.Model):

    class Meta:
        verbose_name = 'Private Message'
        verbose_name_plural = 'Private Messages'

    pubdate = models.DateTimeField('pubdate', auto_now_add=True, editable=False)
    author = models.ForeignKey(Profile, related_name='my_pms')
    penpal = models.ForeignKey(Profile, related_name='pms_with_me')
    seen_by = models.ManyToManyField(Profile, null=True, blank=True, related_name='saw_pm')

    content = models.TextField(null=True, blank=True)

    def seen(self):
        return False

    def __unicode__(self):
        return u"pm with {} - {}".format(self.author.name, self.content[0:10])


def create_profile(sender, **kw):
    user = kw["instance"]
    if kw["created"]:
        profile = Profile(user=user)
        profile.email = user.email
        profile.name = u"{} {}".format(user.first_name, user.last_name)
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
    r = requests.post('http://127.0.0.1:8444/message', data=payload)

    message_author = Profile.objects.get(pk=message.author.id)

    mentions = re.findall('@\*\*([^*]*)\*\*', message.content)
    for mention in mentions:
        try:
            mentionned = Profile.objects.get(name=mention)
            if mentionned.email_on_mention:
                send_mail(
                    'new mention on kwak',
                    u'Someone just mentionned you on kwak:\n\n{} wrote:\n{}\n>\n\n{}'.format(
                        message_author.name,
                        '> '.join(('\n'+message.content.lstrip()).splitlines(True)),
                        message.get_thread_url()
                    ),
                    'noreply@kwak.io',
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
    r = requests.post('http://127.0.0.1:8444/topic', data=payload)
post_save.connect(broadcast_topic, sender=Topic)


def broadcast_pm(sender, instance, **kw):
    pm = instance
    payload = {
        'id': pm.id,
        'pubdate': pm.pubdate,
        'content': pm.content,
        'author': pm.author.id,
        'penpal': pm.penpal.id,
        'penpal_email': pm.penpal.email,
        'penpal_name': pm.penpal.name,
    }
    r = requests.post('http://127.0.0.1:8444/pm', data=payload)

    pm_author = Profile.objects.get(pk=pm.author.id)

    if pm.penpal.email_on_pm:
        send_mail(
            'new pm on kwak',
            u'Someone sent you a private message on kwak:\n\n{} wrote:\n{}\n> '.format(pm_author.name, '> '.join(('\n'+pm.content.lstrip()).splitlines(True))),
            'noreply@kwak.io',
            [pm.penpal.email],
            fail_silently=True)
post_save.connect(broadcast_pm, sender=Pm)


# def user_inactive_by_default(sender, instance, **kw):
#     if instance.pk is None and not instance.is_superuser:
#         instance.is_active = False
# pre_save.connect(user_inactive_by_default, sender=User)
