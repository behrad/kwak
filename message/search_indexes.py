from haystack import indexes
import datetime
from message.models import Message
from django.utils import timezone


class MessageIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)
    topic_id = indexes.CharField(model_attr='topic__id')
    team = indexes.CharField(model_attr='topic__team')
    channel = indexes.CharField(model_attr='topic__channel')
    channel_id = indexes.CharField(model_attr='topic__channel__id')
    channel_color = indexes.CharField(model_attr='topic__channel__color')
    pubdate = indexes.DateTimeField(model_attr='pubdate')
    thread_url = indexes.CharField(model_attr='get_thread_url')

    def get_model(self):
        return Message

    def index_queryset(self, using=None):
        """Used when the entire index for model is updated."""
        return self.get_model().objects.filter(pubdate__lte=timezone.make_aware(datetime.datetime.now(), timezone.get_current_timezone()))
