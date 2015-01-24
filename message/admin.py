from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from message.models import Profile, Team, Channel, Topic, Message, Pm, Subscription


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'userprofiles'

class UserAdmin(UserAdmin):
    inlines = (ProfileInline, )

admin.site.unregister(User)
admin.site.register(User, UserAdmin)

class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'uid')

class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'team')

class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'channel', 'team')

class MessageAdmin(admin.ModelAdmin):
    list_display = ('author', 'topic', 'channel', 'team')

class PmAdmin(admin.ModelAdmin):
    list_display = ('author', 'penpal')

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user')

class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('team', 'plan', 'quantity', 'status', 'cancel_at_period_end', 'same_card', 'current_period_start', 'current_period_end', 'subscription_id')

admin.site.register(Topic, TopicAdmin)
admin.site.register(Team, TeamAdmin)
admin.site.register(Channel, ChannelAdmin)
admin.site.register(Message, MessageAdmin)
admin.site.register(Pm, PmAdmin)
admin.site.register(Profile, ProfileAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
