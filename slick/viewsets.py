from django.contrib.auth.models import User
from message.models import Channel, Topic, Message
from rest_framework.viewsets import ModelViewSet
from slick.serializers import UserSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer

class UserViewSet(ModelViewSet):
    model = User
    queryset = User.objects.all()
    serializer_class = UserSideloadSerializer


class ChannelViewSet(ModelViewSet):
    model = Channel
    queryset = Channel.objects.all()
    serializer_class = ChannelSideloadSerializer


class TopicViewSet(ModelViewSet):
    model = Topic
    queryset = Topic.objects.all()
    serializer_class = TopicSideloadSerializer


class MessageViewSet(ModelViewSet):
    model = Message
    serializer_class = MessageSideloadSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if channel_id is not None:
            queryset = queryset.filter(topic__channel__id=channel_id)
        return queryset
