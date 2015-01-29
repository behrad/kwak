import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'profiles', 'channels/channel/message-create', 'channels/channel/mark-as-read'],
  topicTitle: Ember.computed.oneWay('model.topic.title'),
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]'),

  messages: function () {
    var self = this;
    return this.get('model.messages').filter(function (message) {
      return message.get('topic.id') === self.get('model.topic.id');
    });
  }.property('model.messages.[]'),

  actions: {
    createMessage: function () {
      var channel = this.get('model.topic.channel');

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
    deleteTopic: function () {
      this.get('model.topic').destroyRecord();
      this.transitionToRoute('channels.channel', this.get('model.topic.channel'));
    },
    lockTopic: function () {
      this.get('model.topic').set('is_locked', !this.get('model.topic.is_locked')).save();
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
  }
});
