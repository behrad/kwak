from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from kwak.viewsets import ProfileViewSet, ChannelViewSet, TopicViewSet
from kwak.viewsets import MessageViewSet, PmViewSet
from kwak.viewsets import CurrentProfile, LastMessage, MarkMessageRead
from kwak.viewsets import CreateUserView, FeedbackView, TeamView, PmUnreadView
from kwak.viewsets import Subscriptions, SubscriptionsCheckout, SubscriptionsCancel
from kwak.viewsets import Search, InviteView

from message.views import ResetPasswordRequestView, PasswordResetConfirmView


router = routers.DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'channels', ChannelViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'pms', PmViewSet)


urlpatterns = patterns('',
    url(r'^api/invite', InviteView.as_view()),
    url(r'^api/feedback', FeedbackView.as_view()),
    url(r'^api/users', CreateUserView.as_view()),
    url(r'^api/teams', TeamView.as_view()),
    url(r'^api/pms/unread', PmUnreadView.as_view()),
    url(r'^api/messages/last', LastMessage.as_view()),
    url(r'^api/messages/read', MarkMessageRead.as_view()),
    url(r'^api/profiles/current', CurrentProfile.as_view()),
    url(r'^api/subscriptions/checkout', SubscriptionsCheckout.as_view()),
    url(r'^api/subscriptions/cancel', SubscriptionsCancel.as_view()),
    url(r'^api/subscriptions', Subscriptions.as_view()),
    url(r'^api/auth/token/', 'rest_framework.authtoken.views.obtain_auth_token'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^api/reset_password_confirm/(?P<uidb64>[0-9A-Za-z]+)-(?P<token>.+)/$', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    url(r'^api/reset_password', ResetPasswordRequestView.as_view(), name="reset_password"),
    url(r'^api/search', Search.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^admin/', include(admin.site.urls)),
)
