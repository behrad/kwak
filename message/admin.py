from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from message.models import Profile, Team, Channel, Topic, Message


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'userprofiles'

class UserAdmin(UserAdmin):
    inlines = (ProfileInline, )

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

class TeamAdmin(admin.ModelAdmin):
    pass

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'team')

class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'team')

class MessageAdmin(admin.ModelAdmin):
    list_display = ('author', 'topic', 'channel', 'team')

admin.site.register(Topic, TopicAdmin)
admin.site.register(Team, TeamAdmin)
admin.site.register(Channel, ChannelAdmin)
admin.site.register(Message, MessageAdmin)
