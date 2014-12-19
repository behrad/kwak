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
                self.socket.emit('message', message.toJSON({includeId: true}));
                window.prettyPrint();
                setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
              });
            } else {
              // create new message in existing topic
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function() {
                self.socket.emit('message', message.toJSON());
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
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function(message) {
                self.socket.emit('topic', topic.toJSON());
                self.socket.emit('message', message.toJSON());
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

    },
    message: function(data) {
      var self = this;
      if (self.store.hasRecordForId('message', data.id)) {
        var message = self.store.getById('message', data.id);
        message.set('content', data.content);
        self.get('controllers.channels/channel/index.messages').pushObject(message);
      } else {
        self.store.find('topic', data.topic_id).then(function(topic) {
          self.store.find('profile', data.author_id).then(function(author) {
            var message = self.store.createRecord('message', {
              id: data.id,
              content: data.content,
              topic: topic,
              author: author
            });
            self.get('controllers.channels/channel/index.messages').pushObject(message);
          });
        });
      }
    }
  },
});
