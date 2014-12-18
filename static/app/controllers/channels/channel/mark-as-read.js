import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    markAsRead: function(messageId) {
      var message = this.store.getById('message', messageId);
      message.set('seen', true);
      console.log('TODO: save somehow');
    }
  }
});
