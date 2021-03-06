from message.models import Team, Channel, Topic, Message, Profile, Pm, Subscription
from django.contrib.auth.models import User, Group
from django.db import IntegrityError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.http import HttpResponse
from django.template.loader import render_to_string
import json
import datetime
from collections import defaultdict
import stripe
from django.conf import settings
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from kwak.serializers import ProfileSideloadSerializer, ChannelSideloadSerializer
from kwak.serializers import TopicSideloadSerializer, MessageSideloadSerializer
from kwak.serializers import PmSideloadSerializer, TeamSerializer

from forms import MessageSearchForm

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
        try:
            profile = Profile.objects.filter(pk=pk, teams__in=self.request.user.profile.teams.all()).distinct()[0]
        except IndexError:
            return Response(status=status.HTTP_403_FORBIDDEN)

        modified = False

        if self.request.user.profile.is_admin:
            is_active = self.request.data['profile']['is_active']
            teams = profile.teams.all()

            if not is_active and len(teams) > 1: # cannot be handled programmatically
                return Response({'error': 'User has multiple teams. Cannot deactivate user from all their teams.'}, status=status.HTTP_409_CONFLICT)

            team = self.request.user.profile.teams.all()[0]
            if is_active and len(team.members.filter(user__is_active=True)) >= team.paid_for_users:
                return Response({'error': 'You have reached your active members limit ({}). Please switch your team to a paying account to keep using kwak.io with more than {} active users, or send an email to inquiry@kwak.io.'.format(team.paid_for_users, team.paid_for_users)}, status=status.HTTP_403_FORBIDDEN)

            profile.user.is_active = is_active
            profile.user.save()
            modified = True

        if self.request.data['profile']['email'] == self.request.user.profile.email:
            if 'email_on_mention' in self.request.data['profile']:
                profile.email_on_mention = self.request.data['profile']['email_on_mention']
            if 'email_on_pm' in self.request.data['profile']:
                profile.email_on_pm = self.request.data['profile']['email_on_pm']
            if 'name' in self.request.data['profile']:
                profile.name = self.request.data['profile']['name']
            if 'hide_tour' in self.request.data['profile']:
                profile.hide_tour = self.request.data['profile']['hide_tour']
            profile.save()
            modified = True

        if modified:
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)



class ChannelViewSet(ModelViewSet):
    model = Channel
    serializer_class = ChannelSideloadSerializer

    def get_queryset(self):
        queryset = Channel.objects.filter(team__members=self.request.user.profile)

        subscribed = Channel.objects.filter(readers=self.request.user.profile)

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
            if request.user.profile.is_admin and name and channel.name != name:
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
        queryset = Topic.objects.filter(channel__team__in=self.request.user.profile.teams.all())
        title = self.request.QUERY_PARAMS.get('title', None)
        channel_id = self.request.QUERY_PARAMS.get('channel_id', None)
        if title and channel_id:
            queryset = queryset.filter(channel__id=channel_id).filter(title=title)
        return queryset

    def update(self, request, pk):
        topic = get_object_or_404(Topic, pk=pk)
        profile = request.user.profile
        is_locked = request.data['topic'].get('is_locked', None)
        if profile.is_admin and topic.channel.team in profile.teams.all():
            topic.is_locked = is_locked
            topic.save()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


    def destroy(self, request, pk):
        topic = get_object_or_404(Topic, pk=pk)
        profile = request.user.profile
        if profile.is_admin and topic.channel.team in profile.teams.all():
            topic.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


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
            if message.seen_by.filter(user_id=self.request.user.profile.id) or message.author.pk == self.request.user.profile.pk:
                message.seen = True
            else:
                message.seen = False
        if self.action == 'list':
            queryset = list(queryset)
        return queryset

    def create(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            d = serializer.validated_data
            topic = d['topic']
            author = d['author']
            content = d['content']
            if topic.is_locked:
                return Response(status=status.HTTP_403_FORBIDDEN)
            else:
                message = Message.objects.create(author=author, topic=topic, content=content)
                return Response(
                    {"message":
                        {
                        "pubdate": message.pubdate,
                        "content": message.content,
                        "topic_id": message.topic.id,
                        "seen": True,
                        "author_id": message.author.id,
                        "id": message.id
                        }
                    }, status=status.HTTP_201_CREATED)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

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
            if message.seen_by.filter(user_id=self.request.user.profile.id) or message.author.pk == self.request.user.profile.pk:
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
            return Profile.objects.get(pk=self.request.user.profile.pk)
        else:
            raise Exception("User does not exist")


class LastMessage(RetrieveAPIView):
    model = Message
    serializer_class = MessageSideloadSerializer

    def get_object(self):
        if self.request.user.is_authenticated():
            message = Message.objects.filter(topic__channel__readers=self.request.user.profile).order_by('-id')[0]

            if message.seen_by.filter(user_id=self.request.user.profile.id) or message.author.pk == self.request.user.profile.pk:
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
                return Response({'eTeam' : 'team does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        elif 'user[team]' in request.data:
            is_admin = True
            try:
                team = Team.objects.create(name=request.data['user[team]'])
            except IntegrityError:
                return Response({'eTeam' : 'This team already exists. If you\'d like to join it, ask its admins to give you a special sign-up link.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'eTeam' : 'either join a team or create one'}, status=status.HTTP_400_BAD_REQUEST)

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


class InviteView(APIView):
    model = Message

    def post(self, request):
        payload = json.loads(request.body)
        team = get_object_or_404(Team, pk=payload['team'])
        if request.user.profile.is_admin and team in request.user.profile.teams.all():
            for email in payload['emails']:
                send_mail(
                    u'You have been asked to join "{}" on kwak.io'.format(team.name),
                    render_to_string('emails/invitation.txt', {
                        'team': team, 'profile': request.user.profile}),
                    'noreply@kwak.io',
                    [email],
                    html_message=render_to_string('emails/invitation.html', {
                        'team': team, 'profile': request.user.profile}),
                    fail_silently=True)
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_403_FORBIDDEN)


class TeamView(RetrieveAPIView):
    model = Team
    serializer_class = TeamSerializer
    permission_classes = (AllowAny,)

    def get_object(self):
        uid = self.request.QUERY_PARAMS.get('uid', None)
        if uid:
            return get_object_or_404(Team, uid=uid)

    def put(self, request):
        team = get_object_or_404(Team, uid=self.request.data['team'].get('uid', None))
        profile = self.request.user.profile
        if not profile in team.members.all() or not profile.is_admin:
            return Response(status=status.HTTP_403_FORBIDDEN)

        users_can_change_names = self.request.data['team'].get('users_can_change_names', team.users_can_change_names)

        team.users_can_change_names = users_can_change_names
        team.save()
        serializer = TeamSerializer(team, request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class Subscriptions(APIView):
    model = User

    def get(self, request):
        stripe.api_key = settings.STRIPE_KEY

        output = []

        if stripe.api_key:

            profile = get_object_or_404(Profile, pk=request.user.profile.id)

            if profile.stripe_customer_id:
                customer = stripe.Customer.retrieve(profile.stripe_customer_id)
                subscriptions = customer.subscriptions.data

                for subscription in subscriptions:
                    if subscription.status == 'active':
                        output.append({
                            'cancel_at_period_end': subscription.cancel_at_period_end,
                            'id': len(output),
                            'subscription_id': subscription.id,
                            'start': datetime.datetime.fromtimestamp(subscription.current_period_start),
                            'end': datetime.datetime.fromtimestamp(subscription.current_period_end),
                            'plan_id': subscription.plan.id,
                            'quantity': subscription.quantity,
                        })

        return Response({'subscription': output}, status=status.HTTP_200_OK)


class SubscriptionsCheckout(APIView):
    model = User
    permission_classes = (AllowAny,)

    def post(self, request):
        if not request.user.is_authenticated():
            return Response(status=status.HTTP_403_FORBIDDEN)
        stripe.api_key = settings.STRIPE_KEY

        payload = json.loads(request.body)

        amount = int(payload['amount'])
        price = int(payload['price'])
        users_number = int(payload['usersNumber'])
        error = False

        if price == 3:
            plan = "Annually"
            factor = 12
        elif price == 4:
            plan = "Monthly"
            factor = 1
        else:
            error = True
        if error or factor*price*users_number != amount:
            return Response({'error': 'Plan or sum mismatch.'}, status=status.HTTP_400_BAD_REQUEST)

        profile = get_object_or_404(Profile, pk=request.user.profile.id)
        team = get_object_or_404(Team, pk=payload['team'])

        if profile.stripe_customer_id:
            customer = stripe.Customer.retrieve(profile.stripe_customer_id)
            if payload['same_card']:
                subscription = customer.subscriptions.create(
                    plan=plan,
                    quantity=users_number
                )
                Subscription.objects.create(
                    subscription_id=subscription.id,
                    plan=plan,
                    status='active',
                    cancel_at_period_end=False,
                    quantity=users_number,
                    same_card=True,
                    team=team,
                    current_period_start=datetime.datetime.fromtimestamp(subscription.current_period_start),
                    current_period_end=datetime.datetime.fromtimestamp(subscription.current_period_end),
                    profile=self.request.user.profile,
                )
            else: # new card
                subscription = customer.subscriptions.create(
                    card=payload['token']['id'],
                    plan=plan,
                    quantity=users_number
                )
                Subscription.objects.create(
                    subscription_id=subscription.id,
                    plan=plan,
                    status='active',
                    cancel_at_period_end=False,
                    quantity=users_number,
                    same_card=False,
                    team=team,
                    current_period_start=datetime.datetime.fromtimestamp(subscription.current_period_start),
                    current_period_end=datetime.datetime.fromtimestamp(subscription.current_period_end),
                    profile=self.request.user.profile,
                )
        else: # create a customer
            customer = stripe.Customer.create(
              card=payload['token']['id'],
              plan=plan,
              email=payload['token']['email'],
              quantity=users_number
            )
            profile.stripe_customer_id = customer.id
            profile.save()
            subscription = customer.subscriptions.data[0]
            Subscription.objects.create(
                subscription_id=subscription.id,
                plan=plan,
                status='active',
                cancel_at_period_end=False,
                quantity=users_number,
                same_card=False,
                team=team,
                current_period_start=datetime.datetime.fromtimestamp(subscription.current_period_start),
                current_period_end=datetime.datetime.fromtimestamp(subscription.current_period_end),
                profile=self.request.user.profile,
            )

        team.paid_for_users = team.paid_for_users + users_number
        team.save()

        return Response({
            'quantity': users_number,
            'plan_id': plan,
            'subscription_id': subscription.id,
        }, status=status.HTTP_202_ACCEPTED)


class SubscriptionsCancel(APIView):
    model = User
    permission_classes = (AllowAny,)

    def get(self, request):
        if request.META['REMOTE_ADDR'] != '127.0.0.1':
            return Response(status=status.HTTP_403_FORBIDDEN)
        stripe.api_key = settings.STRIPE_KEY
        subscriptions = Subscription.objects.filter(
            status='active',
            cancel_at_period_end=True,
            current_period_end__lte=datetime.datetime.now()
        )
        output = []
        for sub in subscriptions:
            sub.status = 'cancelled'
            sub.save()

            sub.team.paid_for_users -= sub.quantity
            sub.team.save()
            output.append("{} cancelled {} removed {} users".format(datetime.datetime.now(), sub.subscription_id, sub.quantity))
        if output:
            return Response(output, status=status.HTTP_200_OK)
        else:
            return Response(status=status.HTTP_200_OK)



    def post(self, request):
        stripe.api_key = settings.STRIPE_KEY

        payload = json.loads(request.body)

        profile = get_object_or_404(Profile, pk=request.user.profile.id)
        kwak_subscription = get_object_or_404(Subscription, subscription_id=payload['subscription_id'])

        if profile.stripe_customer_id:
            customer = stripe.Customer.retrieve(profile.stripe_customer_id)
            subscription = customer.subscriptions.retrieve(payload['subscription_id'])
            # quantity = subscription.quantity
            subscription.delete(at_period_end=True)
            kwak_subscription.cancel_at_period_end = True
            kwak_subscription.save()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_202_ACCEPTED)


class Search(APIView):
    model = User

    def get(self, request):
        query = request.GET.get('q', '')
        if not request.user.is_authenticated():
            output = [{'error': 'no auth'}]
        elif len(query) >= 3:
            profile = request.user.profile
            teams = profile.teams.all().values_list('id', flat=True)

            # we retrieve the query to display it in the template
            form = MessageSearchForm(request.GET)

            # we call the search method from the MessageSearchForm. Haystack do the work!
            results = form.search()
            output = [{
                'content': o.text.split("\n", 2),
                'topic_id': o.topic_id,
                'channel': o.channel,
                'channel_id': o.channel_id,
                'channel_color': o.channel_color,
                'url': o.thread_url
            } for o in results if o.team_id in teams]
        else:
            output = [{'error': 'query too short'}]
        return HttpResponse(json.dumps({'results': output}), content_type='application/json')
