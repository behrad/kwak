# -*- coding: utf-8 -*-:
from django.db import models
from django.contrib.auth.models import User
from channel.models import Channel

class Message(models.Model):

    class Meta:
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'

    pubdate = models.DateTimeField('pubdate', auto_now_add=True, editable=False)
    author = models.ForeignKey(User, verbose_name='author')
    channel = models.ForeignKey(Channel, verbose_name='channel')

    content = models.TextField(null=True, blank=True)

    def __unicode__(self):
        return "{} - {}…".format(self.author.username, self.content[0:10])
