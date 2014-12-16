import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['profile', 'channels/channel'],
  topicTitle: Ember.computed.oneWay('model.title'),
  currentUser: Ember.computed.alias('controllers.profile'),
  actions: {
    createMessage: function() {
      var content = this.get('message');
      if (!content.trim()) { return; }

      var channelId = this.get('model.channel.id');

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

      var self = this;
      this.store.find('topic', {title: topicTitle, channel_id: channelId}).then(function(topics) {
        var topic = topics.get('lastObject');
        if (topic) {
          topic.get('messages').createRecord({
            content: content,
            author: self.get('currentUser.model')
          }).save().then(function(message) {
            window.prettyPrint();
            setTimeout(function() { window.scrollTo(0, document.body.scrollHeight); }, 50);
            self.get('controllers.channels/channel.messages').pushObject(message);
          });
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
        self.set('message', '');
      });
    }
  }
});
