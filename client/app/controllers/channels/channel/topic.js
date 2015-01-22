import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profiles', 'channels/channel/message-create', 'channels/channel/mark-as-read'],
  topicTitle: Ember.computed.oneWay('model.topic.title'),
  profiles: Ember.computed.alias('controllers.profiles'),

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]'),

  actions: {
    createMessage: function () {
      mixpanel.track("new message");
      var channel = this.get('model.topic.channel');

      var content = this.get('message');
      if (!content.trim()) { return; }

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

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
  }
});
