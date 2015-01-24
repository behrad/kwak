import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'profiles', 'channels/channel/message-create', 'channels/channel/mark-as-read'],
  topicTitle: Ember.computed.oneWay('model.topic.title'),
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]'),

  actions: {
    createMessage: function () {
      var channel = this.get('model.channel');

      var content = this.get('message');
      if (!content.trim()) { return; }

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

      mixpanel.track("new message");

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
      this.transitionToRoute('channels.channel', this.get('model.channel'));
    },
    lockTopic: function () {
      this.get('model.topic').set('is_locked', true).save();
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
