import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['profile', 'channels', 'channels/channel/index', 'channels/channel/mark-as-read'],
  currentUser: Ember.computed.alias('controllers.profile'),
  sortProperties: ['id'],
  sortAscending: true,
  sortFunction: function(a, b) {
    return +a > +b ? 1 : -1;
  },

  subscribed: function() {
    return this.get('arrangedContent').filterBy('topic.channel.subscribed', true);
  }.property('model.@each.topic.channel.subscribed'),

  actions: {
    createMessage: function() {
      var content = this.get('message');
      if (!content.trim()) { return; }

      var channelId = this.get('channel');

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

      var self = this;
      this.store.find('topic', {title: topicTitle, channel_id: channelId}).then(function(topics) {
        var topic = topics.get('lastObject');
        if (topic) {
          Ember.$.getJSON('/api/messages/last', function(data) {
            var last_message_posted_by = data['message']['author_id'];
            var last_topic_posted_in = data['message']['topic_id'];

            if (+topic.id === last_topic_posted_in && +self.get('currentUser.model.id') === last_message_posted_by) {
              // append to last message
              var message = topic.get('messages.lastObject');
              message.set('content', message.get('content') + "\n\n" + content);
              message.save().then(function() {
                window.prettyPrint();
                setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
              });
            } else {
              // create new message in existing topic
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function() {
                self.set('topicCreated', topic.get('id'));
                console.log(topic.get('id'));
                window.prettyPrint();
                setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
              });
            }
          });
        } else {
          self.store.find('channel', channelId).then(function(channel) {
            // create topic
            self.store.createRecord('topic', {
              title: topicTitle,
              channel: channel
            }).save().then(function(topic) {
              // create message in new topic
              self.set('topicCreated', topic.get('id'));
              console.log(topic.get('id'));
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function() {
                window.prettyPrint();
                setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
              });
            });
          });
        }
        self.set('message', '');
      });
    },
    markAsRead: function(messageId) {
      this.get('controllers.channels/channel/mark-as-read').send(
        'markAsRead',
        messageId
      );
    }
  },
  sockets: {
    topic: function(data) {
      var self = this;
      setTimeout(function() {
        console.log(data.id, self.get('topicCreated'));
        if (data.id === self.get('topicCreated')) {
          Ember.Logger.debug('it\'s my topic!');
          return;
        }
        if (!self.store.hasRecordForId('topic', data.id)) {
          self.store.find('channel', data.channel).then(function(channel) {
            Ember.Logger.debug('createRecord topic', data);
            self.store.createRecord('topic', {
              id: data.id,
              title: data.title,
              channel: channel
            });
          });
        }
      }, 1000);
    },
    message: function(data) {
      var self = this;
      setTimeout(function() {
        if (data.author === self.get('currentUser.id')) {
          Ember.Logger.debug('it\'s me message!');
          return;
        }
        if (self.store.hasRecordForId('message', data.id)) {
          var message = self.store.getById('message', data.id);
          message.set('content', data.content);
          // var channelIndex = self.get('controllers.channels/channel/index.messages');
          // if (channelIndex) {
          //   channelIndex.pushObject(message);
          // }
        } else {
          self.store.find('topic', data.topic).then(function(topic) {
            self.store.find('profile', data.author).then(function(author) {
              Ember.Logger.debug('createRecord message', data);
              var message = self.store.createRecord('message', {
                id: data.id,
                content: data.content,
                topic: topic,
                author: author
              });
              var channelIndex = self.get('controllers.channels/channel/index.messages');
              if (channelIndex) {
                Ember.Logger.debug('pushObject message', message);
                channelIndex.pushObject(message);
              }
            });
          });
        }
      }, 3000);
    }
  },
});
