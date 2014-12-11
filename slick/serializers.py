from rest_framework.serializers import ModelSerializer, HyperlinkedIdentityField
from ember_drf.serializers import SideloadSerializer
from django.contrib.auth.models import User
from channel.models import Channel
from message.models import Message

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
        fields = ('id', 'pubdate', 'author', 'channel', 'content')

class MessageSideloadSerializer(SideloadSerializer):
    class Meta:
        base_serializer = MessageSerializer
        sideloads = [
            (Channel, ChannelSerializer)
        ]
