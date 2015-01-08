from message.models import Team, Channel, Topic, Message, Profile, Pm
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.db.models import Q
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from kwak.serializers import ProfileSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer, PmSideloadSerializer

class ProfileViewSet(ModelViewSet):
    model = Profile
    serializer_class = ProfileSideloadSerializer

    def get_queryset(self):
        email = self.request.QUERY_PARAMS.get('email', None)
        if email:
            try:
                return [Profile.objects.get(email=email, teams__in=self.request.user.profile.teams.all())]
            except Profile.DoesNotExist:
                return []
        return Profile.objects.filter(teams__in=self.request.user.profile.teams.all())


class ChannelViewSet(ModelViewSet):
    model = Channel
    serializer_class = ChannelSideloadSerializer

    def get_queryset(self):
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
        if not request.data['channel'].get('team_id', False):
            request.data['channel']['team'] = request.user.profile.teams.all()[0].id
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
        if title and channel_id:
            queryset = queryset.filter(channel__id=channel_id).filter(title=title)
        return queryset


class MessageViewSet(ModelViewSet):
    model = Message
    serializer_class = MessageSideloadSerializer

    def get_queryset(self):
        queryset = Message.objects.filter(topic__channel__readers=self.request.user.profile).order_by('id')
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if channel_id:
            queryset = queryset.filter(topic__channel__id=channel_id)

        topic_id = self.request.QUERY_PARAMS.get('topic_id', None)
        if topic_id:
            queryset = queryset.filter(topic__id=topic_id)

        for message in queryset:
            if message.seen_by.filter(user_id=self.request.user.id) or message.author.pk == self.request.user.profile.pk:
                message.seen = True
            else:
                message.seen = False
        if self.action == 'list':
            queryset = list(queryset)
        return queryset

    def update(self, request, pk=None):
        message = Message.objects.get(pk=pk)
        if request.user.profile.id != message.author.id:
            return Response(status=status.HTTP_403_FORBIDDEN)

        message.content = request.data['message']['content']
        message.save()

        return Response({'message': {
            'id': message.id,
            'pubdate': message.pubdate,
            'seen': 'true',
            'author_id': message.author.id,
            'content': message.content,
        }}, status=status.HTTP_202_ACCEPTED)


class PmViewSet(ModelViewSet):
    model = Pm
    serializer_class = PmSideloadSerializer

    def get_queryset(self):
        penpal = self.request.QUERY_PARAMS.get('email', None)
        try:
            penpal = Profile.objects.get(email=penpal)
        except Profile.DoesNotExist:
            return []
        queryset = Pm.objects.filter(Q(author=self.request.user.profile, penpal=penpal) | Q(penpal=self.request.user.profile, author=penpal))
        return queryset

    def create(self, request):
        pm = request.data['pm']
        penpal = Profile.objects.get(pk=pm['penpal'], teams__in=self.request.user.profile.teams.all())
        pm = Pm.objects.create(author=self.request.user.profile, penpal=penpal, content=pm['content'])
        return Response({'pm': {
            'pubdate': pm.pubdate,
            'author_id': pm.author.id,
            'penpal_id': pm.penpal.id,
            'content': pm.content
        }}, status=status.HTTP_201_CREATED)


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
            message = Message.objects.filter(topic__channel__readers=self.request.user.profile).order_by('-id')[0]

            if message.seen_by.filter(user_id=self.request.user.id) or message.author.pk == self.request.user.profile.pk:
                message.seen = True
            else:
                message.seen = False
            return message
        else:
            raise Exception("Message does not exist")


class MarkMessageRead(APIView):
    model = Message

    def post(self, request):
        messages = Message.objects.filter(id__in=self.request.POST.getlist('messages[]'))
        for message in messages:
            message.seen_by.add(self.request.user.profile)

        return Response(status=status.HTTP_204_NO_CONTENT)


class UserView(APIView):
    model = User
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            user = User.objects.create_user(
                username=request.data['user[identification]'],
                first_name=request.data['user[firstName]'],
                last_name=request.data['user[lastName]'],
                email=request.data['user[email]'],
                password=request.data['user[password]']
            )
        except IntegrityError:
            return Response({'error' : 'username already taken'}, status=status.HTTP_409_CONFLICT)

        return Response(status=status.HTTP_201_CREATED)
