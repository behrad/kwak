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
});
