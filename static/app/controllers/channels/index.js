import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['profile', 'channels'],
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
          if (self.get('currentUser.model.name') === topic.get('messages.lastObject.author.name')) {
            // save content to last message
            var message = topic.get('messages.lastObject');
            message.set('content', message.get('content') + "\n\n" + content);
            message.save().then(function() {
              window.prettyPrint();
              setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
            });
          } else {
            topic.get('messages').createRecord({
              content: content,
              author: self.get('currentUser.model')
            }).save().then(function() {
              window.prettyPrint();
              setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
            });
          }
        } else {
          self.store.find('channel', channelId).then(function(channel) {
            self.store.createRecord('topic', {
              title: topicTitle,
              channel: channel
            }).save().then(function(topic) {
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
    }
  }
});
