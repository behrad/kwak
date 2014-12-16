from rest_framework.serializers import ModelSerializer
from ember_drf.serializers import SideloadSerializer
from message.models import Channel, Topic, Message, Profile

class ProfileSerializer(ModelSerializer):

    class Meta:
        model = Profile
        fields = ('id', 'name', 'email')

class ProfileSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = ProfileSerializer
        sideloads = []


class ChannelSerializer(ModelSerializer):
    class Meta:
        model = Channel
        fields = ('id', 'name')

class ChannelSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = ChannelSerializer
        sideloads = []


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = ('id', 'pubdate', 'author', 'topic', 'content')

class MessageSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = MessageSerializer
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
