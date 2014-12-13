from django.contrib.auth.models import User
from message.models import Channel, Topic, Message
from rest_framework.viewsets import ModelViewSet
from slick.serializers import UserSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer, MeSideloadSerializer

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
    serializer_class = TopicSideloadSerializer

    def get_queryset(self):
        queryset = Topic.objects.all()
        title = self.request.QUERY_PARAMS.get('title', None)
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        # TODO : check permission. Is user allowed to create a topic in channel_id ?
        if title is not None and channel_id is not None:
            queryset = queryset.filter(channel__id=channel_id).filter(title=title)
            if not list(queryset): # if nothing found create topic
                topic = Topic.objects.create(channel_id=channel_id, title=title)
                queryset = Topic.objects.filter(pk=topic.pk)
        return queryset


class MessageViewSet(ModelViewSet):
    model = Message
    serializer_class = MessageSideloadSerializer

    def get_queryset(self):
        queryset = Message.objects.all()
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if channel_id is not None:
            queryset = queryset.filter(topic__channel__id=channel_id)

        topic_id = self.request.QUERY_PARAMS.get('topic_id', None)
        if topic_id is not None:
            queryset = queryset.filter(topic__id=topic_id)
        return queryset


class MeViewSet(ModelViewSet):
    model = User
    serializer_class = MeSideloadSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated():

            queryset = User.objects.filter(pk=self.request.user.pk)
            return queryset
        else:
            return User.objects.filter(pk=-1)
