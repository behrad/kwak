from message.models import Team, Channel, Topic, Message, Profile
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from kwak.serializers import ProfileSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer

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
        for channel in list(queryset.order_by('name')):
            channel.subscribed = channel in subscribed
            new_queryset.append(channel)

        return new_queryset

    def update(self, request, pk=None):
        channel = Channel.objects.get(pk=pk)
        if request.user.profile not in channel.team.members.all():
            return Response(status=status.HTTP_403_FORBIDDEN)
        name = request.data['channel']['name']
        color = request.data['channel']['color']
        subscribed = request.data['channel']['subscribed']
        if channel.color != color:
            channel.color = color
        if channel.name != name:
            channel.name = name
        if subscribed:
            channel.readers.add(self.request.user.profile)
        else:
            channel.readers.remove(self.request.user.profile)
        channel.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request):
        request.data['channel']['topics'] = []
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            d = serializer.validated_data

            if request.user.profile not in Team.objects.get(pk=d['team'].id).members.all():
                return Response(status=status.HTTP_403_FORBIDDEN)

            channel = Channel.objects.create(name=d['name'], color=d['color'], team=d['team'])

            return Response({'channel': {
                'id': channel.id,
                'name': channel.name,
                'color': channel.color,
                'topics': [],
                'team': channel.team.id,
                'subscribed': False
            }}, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'Bad request',
            'message': 'Channel could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)


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
        queryset = Message.objects.filter(topic__channel__readers=self.request.user.profile).order_by('id')
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if channel_id is not None:
            queryset = queryset.filter(topic__channel__id=channel_id)

        topic_id = self.request.QUERY_PARAMS.get('topic_id', None)
        if topic_id is not None:
            queryset = queryset.filter(topic__id=topic_id)

        for message in queryset:
            if message.seen_by.filter(user_id=self.request.user.id):
                message.seen = True
            else:
                message.seen = False
        return queryset


class CurrentUser(RetrieveAPIView):
    model = Profile
    serializer_class = ProfileSideloadSerializer

    def get_object(self):
        if self.request.user.is_authenticated():
            return Profile.objects.get(pk=self.request.user.pk)
        else:
            raise Exception("User does not exist")


class LastMessage(RetrieveAPIView):
    model = Message
    serializer_class = MessageSideloadSerializer

    def get_object(self):
        if self.request.user.is_authenticated():
            return Message.objects.filter(topic__channel__readers=self.request.user.profile).order_by('-id')[0]
        else:
            raise Exception("Message does not exist")


class MarkMessageRead(APIView):
    model = Message

    def post(self, request):
        messages = Message.objects.filter(id__in=self.request.POST.getlist('messages[]'))
        for message in messages:
            message.seen_by.add(self.request.user.profile)

        return Response(status=status.HTTP_204_NO_CONTENT)
