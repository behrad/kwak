from message.models import Team, Channel, Topic, Message, Profile, Pm
from django.contrib.auth.models import User, Group
from django.db import IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
import json
from collections import defaultdict
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from kwak.serializers import ProfileSideloadSerializer, ChannelSideloadSerializer, TopicSideloadSerializer, MessageSideloadSerializer, PmSideloadSerializer, TeamSerializer


class ProfileViewSet(ModelViewSet):
    model = Profile
    serializer_class = ProfileSideloadSerializer

    def get_queryset(self):
        email = self.request.QUERY_PARAMS.get('email', None)
        if email:
            try:
                return [Profile.objects.get(email=email, user__is_active=True, teams__in=self.request.user.profile.teams.all())]
            except Profile.DoesNotExist:
                return []
        if self.request.user.profile.is_admin:
            return Profile.objects.filter(teams__in=self.request.user.profile.teams.all())
        else:
            return Profile.objects.filter(user__is_active=True, teams__in=self.request.user.profile.teams.all())

    def update(self, request, pk=None):
        if not self.request.user.profile.is_admin:
            return Response(status=status.HTTP_403_FORBIDDEN)

        profile = Profile.objects.get(pk=pk, teams__in=self.request.user.profile.teams.all())
        is_active = self.request.data['profile']['is_active']
        teams = profile.teams.all()

        if not is_active and len(teams) > 1: # cannot be handled programmatically
            return Response({'error': 'User has multiple teams. Cannot deactivate user from all their teams.'}, status=status.HTTP_409_CONFLICT)

        team = teams[0]
        if is_active and not team.is_paying and len(team.members.filter(user__is_active=True)) >= 5:
            return Response({'error': 'You have reached your active members limit. Please switch your team to a paying account to keep using kwak.io with more than 5 active users.'}, status=status.HTTP_403_FORBIDDEN)

        profile.user.is_active = is_active
        profile.user.save()

        return Response(self.request.data, status=status.HTTP_204_NO_CONTENT)



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
        name = request.data['channel'].get('name', None)
        color = request.data['channel'].get('color', None)
        subscribed = request.data['channel'].get('subscribed', None)
        is_default = request.data['channel'].get('is_default', None)
        default_changed = (is_default != channel.is_default)

        if not default_changed:
            if color and channel.color != color:
                channel.color = color
            if name and channel.name != name:
                channel.name = name
            if subscribed is True:
                channel.readers.add(self.request.user.profile)
            elif subscribed is False:
                channel.readers.remove(self.request.user.profile)
            channel.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            if self.request.user.profile.is_admin:
                if is_default is True:
                    channel.is_default = True
                elif is_default is False:
                    channel.is_default = False
            channel.save()
            channel.subscribed = True
            return Response(ChannelSideloadSerializer(channel).data, status=status.HTTP_200_OK)

    def create(self, request):
        request.data['channel']['topics'] = [] # required by the serializer
        my_teams = request.user.profile.teams.all().values('id')
        my_teams_ids = [x['id'] for x in my_teams]

        if not request.data['channel']['team']:
            request.data['channel']['team'] = str(my_teams_ids[0])

        if not request.data['channel'].get('team_id', False):
            if request.data['channel']['team'] is None or int(request.data['channel']['team']) not in my_teams_ids:
                return Response({
                    'status': 'Bad request',
                    'message': 'Channel could not be created with received data.'
                }, status=status.HTTP_400_BAD_REQUEST)

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

        for message in queryset:
            if message.seen_by.filter(user_id=self.request.user.id) or message.author.pk == self.request.user.profile.pk:
                message.seen = True
            else:
                message.seen = False
        if self.action == 'list':
            queryset = list(queryset)
        return queryset

    def create(self, request):
        pm = request.data['pm']
        try:
            penpal = Profile.objects.get(pk=pm['penpal'], teams__in=self.request.user.profile.teams.all())
            pm = Pm.objects.create(author=self.request.user.profile, penpal=penpal, content=pm['content'])
            return Response({'pm': {
                'id': pm.id,
                'pubdate': pm.pubdate,
                'author_id': pm.author.id,
                'penpal_id': pm.penpal.id,
                'content': pm.content
            }}, status=status.HTTP_201_CREATED)
        except Profile.DoesNotExist:
            return Response({
                'status': 'Bad request',
                'message': 'Channel could not be created with received data.'
            }, status=status.HTTP_400_BAD_REQUEST)


class PmUnreadView(APIView):
    model = Pm

    def get(self, request):
        queryset = Pm.objects.filter(penpal=self.request.user.profile)
        queryset = queryset.exclude(seen_by=self.request.user.profile)
        out = defaultdict(int)
        for pm in queryset:
            out[pm.author.id] += 1

        return Response(out, status=status.HTTP_200_OK)


class CurrentProfile(RetrieveAPIView):
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
        array = json.loads(request.body)
        msgs_id = [x['id'] for x in array if x['type'] == 'message']
        pms_id = [x['id'] for x in array if x['type'] == 'pm']

        messages = Message.objects.filter(id__in=msgs_id)
        for message in messages:
            message.seen_by.add(self.request.user.profile)

        messages = Pm.objects.filter(id__in=pms_id)
        for message in messages:
            message.seen_by.add(self.request.user.profile)

        return Response(status=status.HTTP_204_NO_CONTENT)


class CreateUserView(APIView):
    model = User
    permission_classes = (AllowAny,)

    def post(self, request):
        if 'user[uid]' in request.data:
            is_admin = False
            try:
                team = Team.objects.get(uid=request.data['user[uid]'])
            except Team.DoesNotExist:
                return Response({'error' : 'team does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'user[team]' in request.data:
            is_admin = True
            team = Team.objects.create(name=request.data['user[team]'])
        else:
            return Response({'error' : 'either join a team or create one'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_group = Group.objects.get(name='user')
        except Group.DoesNotExist:
            return Response({'error' : 'user group does not exist'}, status=status.HTTP_400_BAD_REQUEST)

        # try to find user with email
        try:
            User.objects.get(email=request.data['user[identification]'])
            return Response({'emailError' : 'email address already in use'}, status=status.HTTP_409_CONFLICT)
        except User.DoesNotExist:
            pass

        try:
            user = User.objects.create_user( # create user
                username=request.data['user[identification]'],
                first_name=request.data['user[firstName]'],
                last_name=request.data['user[lastName]'],
                email=request.data['user[identification]'],
                password=request.data['user[password]'],
            )
            user.is_active = is_admin
            user.save()
            user.profile.is_admin = is_admin
            user.profile.save()

            user.profile.teams.add(team) # add user to team
            channels = Channel.objects.filter(team=team, is_default=True)
            for channel in channels:
                # add user to default channels
                channel.readers.add(user.profile)
            user.groups.add(user_group) # add user to user group
            if not is_admin:
                admins = Profile.objects.filter(is_admin=True, teams=team)
                for admin in admins:
                    send_mail(
                        'kwak: new user on board',
                        u'Dear admin of the "{}" team, a new user just signed up and is awaiting validation.\n\nYour new user is:\n{} {} ({})\n\nLink to your admin panel: https://kwak.io/channels/admin'.format(
                            team.name,
                            user.first_name,
                            user.last_name,
                            user.email
                            ),
                        'noreply@kwak.io',
                        [admin.user.email],
                        fail_silently=True)
        except IntegrityError:
            return Response({'error' : 'email already in use'}, status=status.HTTP_409_CONFLICT)

        return Response(status=status.HTTP_201_CREATED)


class FeedbackView(APIView):
    model = Message

    def post(self, request):
        send_mail(
            'kwak: feedback',
            request.data['feedback'],
            self.request.user.profile.email,
            ['feedback@kwak.io'],
            fail_silently=True)
        return Response(status=status.HTTP_201_CREATED)


class TeamView(RetrieveAPIView):
    model = Team
    serializer_class = TeamSerializer
    permission_classes = (AllowAny,)

    def get_object(self):
        uid = self.request.QUERY_PARAMS.get('uid', None)
        if uid:
            return get_object_or_404(Team, uid=uid)
