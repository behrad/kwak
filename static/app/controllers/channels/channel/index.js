import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['channels/channel/message-create', 'channels/channel/mark-as-read'],
  topicTitle: Ember.computed.oneWay('model.title'),
  actions: {
    createMessage: function() {
      var channel = this.get('model.channel');

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
    markAsRead: function(messageId) {
      this.get('controllers.channels/channel/mark-as-read').send(
        'markAsRead',
        messageId
      );
    }
  }
});
