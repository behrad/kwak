import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['channels/channel/message-create'],
  topicTitle: Ember.computed.oneWay('model.title'),
  actions: {
    createMessage: function() {
      var channelId = this.get('model.channel.id');

      var content = this.get('message');
      if (!content.trim()) { return; }

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

      this.get('controllers.channels/channel/message-create').send(
        'createMessage',
        channelId,
        content,
        topicTitle
      );
      this.set('message', '');
    }
  }
});
