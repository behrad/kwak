import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['user'],
  topicTitle: Ember.computed.oneWay('model.title'),
  currentUser: Ember.computed.alias('controllers.user'),
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
          }).save();
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
