import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    markAsRead: function (messageId) {
      if (messageId) {
        this.store.find('message', messageId).then(function (message) {
          window.cursor = messageId;
          message.get('topic.channel').set('cursor', messageId);
          message.set('seen', true);
          Ember.Logger.debug('TODO: save somehow. Read:', messageId);
        });
      }
    }
  }
});
