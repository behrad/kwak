from django.contrib.auth.models import User
from channel.models import Channel
from message.models import Message
from rest_framework.viewsets import ModelViewSet
from slick.serializers import UserSerializer, ChannelSerializer, MessageSerializer

class UserViewSet(ModelViewSet):
    model = User
    queryset = User.objects.all()
    serializer_class = UserSerializer


class ChannelViewSet(ModelViewSet):
    model = Channel
    queryset = Channel.objects.all()
    serializer_class = ChannelSerializer


class MessageViewSet(ModelViewSet):
    model = Message
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
