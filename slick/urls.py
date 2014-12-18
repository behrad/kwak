from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from slick.viewsets import ProfileViewSet, ChannelViewSet, TopicViewSet, MessageViewSet, CurrentUser, LastMessage

router = routers.DefaultRouter()
router.register(r'profiles', ProfileViewSet)
router.register(r'channels', ChannelViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'messages', MessageViewSet)


urlpatterns = patterns('',
    url(r'^api/messages/last', LastMessage.as_view()),
    url(r'^api/profiles/current', CurrentUser.as_view()),
    url(r'^api/', include(router.urls)),
    url(r'^api/auth/token/', 'rest_framework.authtoken.views.obtain_auth_token'),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    url(r'^admin/', include(admin.site.urls)),
)
