import requests

def message(self):
    message = self
    payload = {
        'id': message.id,
        'pubdate': message.pubdate,
        'content': message.content,
        'author': message.author.id,
        'topic': message.topic.id,
    }
    r = requests.post('http://localhost:8080/message', data=payload)


def topic(self):
    topic = self
    payload = {
        'id': topic.id,
        'title': topic.title,
        'channel': topic.channel.id,
    }
    r = requests.post('http://localhost:8080/topic', data=payload)
