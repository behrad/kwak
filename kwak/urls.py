from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from kwak.viewsets import ProfileViewSet, ChannelViewSet, TopicViewSet, MessageViewSet, PmViewSet
from kwak.viewsets import CurrentUser, LastMessage, MarkMessageRead, UserView, TeamView

router = routers.DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'channels', ChannelViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'pms', PmViewSet)


urlpatterns = patterns('',
    url(r'^api/users', UserView.as_view()),
    url(r'^api/teams', TeamView.as_view()),
    url(r'^api/messages/last', LastMessage.as_view()),
    url(r'^api/messages/read', MarkMessageRead.as_view()),
    url(r'^api/profiles/current', CurrentUser.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^api/auth/token/', 'rest_framework.authtoken.views.obtain_auth_token'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
)
