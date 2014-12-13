from rest_framework.serializers import ModelSerializer, HyperlinkedIdentityField
from ember_drf.serializers import SideloadSerializer
from django.contrib.auth.models import User
from message.models import Channel, Topic, Message

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'url', 'username', 'first_name', 'last_name', 'email', 'is_staff')

class UserSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = UserSerializer
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
        read_only_fields = 'messages',

class TopicSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = TopicSerializer
        sideloads = [
            (Message, MessageSerializer),
        ]
