import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['profile', 'profiles', 'channels', 'channels/channel/index', 'channels/channel/mark-as-read'],
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  sortProperties: ['id'],
  sortAscending: true,
  sortFunction: function (a, b) {
    return +a > +b ? 1 : -1;
  },

  subscribed: function () {
    return this.get('arrangedContent').filterBy('topic.channel.subscribed', true);
  }.property('model.@each.topic.channel.subscribed'),

  actions: {
    createMessage: function () {
      var content = this.get('message');
      if (!content.trim()) { return; }

      var channelId = this.get('channel');

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

      var self = this;
      this.store.find('topic', {title: topicTitle, channel_id: channelId}).then(function (topics) {
        var topic = topics.get('lastObject');
        if (topic) {
          Ember.$.getJSON('/api/messages/last', function (data) {
            var last_message_posted_by = data['message']['author_id'];
            var last_topic_posted_in = data['message']['topic_id'];

            if (+topic.id === last_topic_posted_in && +self.get('currentUser.model.id') === last_message_posted_by) {
              // append to last message
              var message = topic.get('messages.lastObject');
              message.set('content', message.get('content') + "\n\n" + content);
              message.save().then(function (message) {
                message.set('seen', true);
                window.prettyPrint();
              });
            } else {
              // create new message in existing topic
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function (message) {
                message.set('seen', true);
                self.set('topicCreated', topic.get('id'));
                window.prettyPrint();
              });
            }
          });
        } else {
          self.store.find('channel', channelId).then(function (channel) {
            // create topic
            self.store.createRecord('topic', {
              title: topicTitle,
              channel: channel
            }).save().then(function (topic) {
              // create message in new topic
              self.set('topicCreated', topic.get('id'));
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function (message) {
                message.set('seen', true);
                window.prettyPrint();
              });
            });
          });
        }
        self.set('message', '');
      });
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
    setupMessagebox: function(topicTitle, channelId) {
      this.set('channel', channelId);
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
            self.store.createRecord('topic', {
              id: data.id,
              title: data.title,
              channel: channel
            });
          });
        }
      }, 100);
    },
    message: function (data) {
      var now = new Date();
      window.localStorage['timestamp'] = now.getTime();
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
              var message = self.store.createRecord('message', {
                id: data.id,
                content: data.content,
                topic: topic,
                author: author
              });
              var channelIndex = self.get('controllers.channels/channel/index.messages');
              if (channelIndex) {
                channelIndex.pushObject(message);
              }
            });
          });
        }
      }, 200);
    },
    names: function (names) {
      this.get('controllers.channels').set('names', names);
    },
  },
});
