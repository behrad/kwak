from rest_framework.serializers import ModelSerializer, SerializerMethodField
from ember_drf.serializers import SideloadSerializer
from message.models import Channel, Topic, Message, Profile, Team, Pm

class ProfileSerializer(ModelSerializer):

    class Meta:
        model = Profile
        fields = ('id', 'name', 'email', 'is_admin', 'is_active', 'cursor')

class ProfileSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = ProfileSerializer
        sideloads = []


class TeamSerializer(ModelSerializer):
    class Meta:
        model = Team
        fields = ('id', 'name')
        read_only_fields = ('name')


class MessageSerializer(ModelSerializer):
    def is_seen(self, message):
        if 'request' in self.context:
            if message.seen_by.filter(user_id=self.context['request'].user.id) or message.author.pk == self.context['request'].user.profile.pk:
                return True
            else:
                return False
        else:
            return True
    seen = SerializerMethodField('is_seen')
    class Meta:
        model = Message
        fields = ('id', 'pubdate', 'author', 'topic', 'content', 'seen')

class MessageSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = MessageSerializer
        sideloads = []


class PmSerializer(ModelSerializer):
    def is_seen(self, pm):
        if 'request' in self.context:
            if pm.seen_by.filter(user_id=self.context['request'].user.id) or pm.author.pk == self.context['request'].user.profile.pk:
                return True
            else:
                return False
        else:
            return True
    seen = SerializerMethodField('is_seen')
    class Meta:
        model = Pm
        fields = ('id', 'pubdate', 'author', 'penpal', 'content', 'seen')

class PmSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = PmSerializer
        sideloads = []


class TopicSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = ('id', 'title', 'channel', 'messages')
        read_only_fields = ('messages',)

class TopicSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = TopicSerializer
        sideloads = [
            (Message, MessageSerializer),
        ]


class ChannelSerializer(ModelSerializer):
    class Meta:
        model = Channel
        fields = ('id', 'name', 'color', 'subscribed', 'team', 'topics')

class ChannelSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = ChannelSerializer
        sideloads = [
            (Team, TeamSerializer),
            (Topic, TopicSerializer)
        ]
