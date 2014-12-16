from message.models import Channel, Topic, Message, Profile
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from slick.serializers import ProfileSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer

class ProfileViewSet(ModelViewSet):
    model = Profile
    queryset = Profile.objects.all()
    serializer_class = ProfileSideloadSerializer


class ChannelViewSet(ModelViewSet):
    model = Channel
    serializer_class = ChannelSideloadSerializer

    def get_queryset(self):
        if not self.request.user.is_authenticated():
            return []
        queryset = Channel.objects.filter(team__members=self.request.user)

        subscribed = Channel.objects.filter(readers=self.request.user)

        new_queryset = []
        for channel in list(queryset):
            channel.subscribed = channel in subscribed
            new_queryset.append(channel)

        return new_queryset


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
    model = Profile
    serializer_class = ProfileSideloadSerializer

    def get_object(self):
        if self.request.user.is_authenticated():
            return Profile.objects.get(pk=self.request.user.pk)
        else:
            raise Exception("User does not exist")
