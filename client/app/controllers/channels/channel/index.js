import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['profiles', 'channels/channel/message-create', 'channels/channel/mark-as-read'],
  profiles: Ember.computed.alias('controllers.profiles'),

  _init: function () {
    Ember.run.scheduleOnce('afterRender', this, messageAfterRender);
  }.observes('model.[]'),

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]'),

  messages: function () {
    var self = this;
    return this.get('model.messages').filter(function (message) {
      return message.get('topic.channel.id') === self.get('model.channel.id');
    }).sort(function (a, b) {
      return +a.get('id') > +b.get('id');
    });
  }.property('model.messages.[]'),

  topicTitle: '',

  actions: {
    createMessage: function () {
      var channel = this.get('channel');

      var content = this.get('message');
      if (!content.trim()) { this.get('flashes').warning('Please enter a message'); return; }

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { this.get('flashes').warning('Please enter a topic'); return; }

      mixpanel.track("new message");
      this.get('flashes').success('Message posted!');

      this.get('controllers.channels/channel/message-create').send(
        'createMessage',
        channel,
        content,
        topicTitle
      );
      this.set('message', '');
    },
    markAsRead: function (messageId) {
      var controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('markAsRead', messageId);
      }
    },
    recountUnread: function () {
      var controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('recountUnread');
      }
    },
    setupMessagebox: function(topicTitle) {
      this.set('topicTitle', topicTitle);
    }
  },

  sockets: {
    topic: function (data) {
      var self = this;
      setTimeout(function () {
        if (data.id === self.get('topicCreated')) {
          // It's my own topic coming back like a boomerang
          return;
        }
        if (!self.store.hasRecordForId('topic', data.id)) {
          self.store.find('channel', data.channel).then(function (channel) {
            self.store.push('topic', {
              id: data.id,
              title: data.title,
              channel: channel
            });
          });
        }
      }, 1000);
    },

    message: function (data) {
      var self = this;
      setTimeout(function () {
        if (data.author === self.get('currentUser.id')) {
          // It's my own message coming back like a boomerang
          return;
        }
        if (self.store.hasRecordForId('message', data.id)) {
          var message = self.store.getById('message', data.id);
          message.set('content', data.content);
        } else {
          self.store.find('topic', data.topic).then(function (topic) {
            self.store.find('profile', data.author).then(function (author) {
              var message = self.store.push('message', {
                id: data.id,
                pubdate: data.pubdate,
                content: data.content,
                topic: topic,
                author: author
              });
              if (self.get('model')) {
                self.get('model.messages').pushObject(message);
              }
            });
          });
        }
        Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
      }, 2000);
    },
  },
});
