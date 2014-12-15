from django.contrib.auth.models import User, AnonymousUser
from message.models import Channel, Topic, Message
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from slick.serializers import UserSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer

class UserViewSet(ModelViewSet):
    model = User
    queryset = User.objects.all()
    serializer_class = UserSideloadSerializer


class ChannelViewSet(ModelViewSet):
    model = Channel
    serializer_class = ChannelSideloadSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated():
            return []
        queryset = Channel.objects.filter(team__members=self.request.user)

        subscribed = self.request.QUERY_PARAMS.get('subscribed', None)
        if subscribed:
            queryset = queryset.filter(subscribers=self.request.user)

        return queryset


class TopicViewSet(ModelViewSet):
    model = Topic
    serializer_class = TopicSideloadSerializer

    def get_queryset(self):
        queryset = Topic.objects.all()
        title = self.request.QUERY_PARAMS.get('title', None)
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if title is not None and channel_id is not None:
            queryset = queryset.filter(channel__id=channel_id).filter(title=title)
        return queryset


class MessageViewSet(ModelViewSet):
    model = Message
    serializer_class = MessageSideloadSerializer

    def get_queryset(self):
        queryset = Message.objects.all().order_by('id')
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if channel_id is not None:
            queryset = queryset.filter(topic__channel__id=channel_id)

        topic_id = self.request.QUERY_PARAMS.get('topic_id', None)
        if topic_id is not None:
            queryset = queryset.filter(topic__id=topic_id)
        return queryset


class MeView(RetrieveAPIView):
    model = User
    serializer_class = UserSideloadSerializer

    def get_object(self):
        if self.request.user.is_authenticated():
            return User.objects.get(pk=self.request.user.pk)
        else:
            raise Exception("User does not exist")
