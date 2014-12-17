import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['profile', 'channels/channel'],
  currentUser: Ember.computed.alias('controllers.profile'),
  actions: {
    createMessage: function(channelId, content, topicTitle) {

      var self = this;
      self.store.find('topic', {title: topicTitle, channel_id: channelId}).then(function(topics) {
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
            // create new message
            topic.get('messages').createRecord({
              content: content,
              author: self.get('currentUser.model')
            }).save().then(function(message) {
              window.prettyPrint();
              setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
              self.get('controllers.channels/channel.messages').pushObject(message);
            });
          }
        } else {
          self.store.createRecord('topic', {
            title: topicTitle,
            channel: self.get('model.channel')
          }).save().then(function(topic) {
            topic.get('messages').createRecord({
              content: content,
              author: self.get('currentUser.model')
            }).save().then(function (message) {
              message.get('topic').then(function (topic) {
                window.prettyPrint();
                self.get('controllers.channels/channel.messages').pushObject(message);
                self.transitionToRoute('channels.channel.topic', topic);
              });
            });
          });
        }
      });
    }
  }
});
