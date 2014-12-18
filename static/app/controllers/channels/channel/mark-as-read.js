import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    markAsRead: function(messageId) {
      var message = this.store.getById('message', messageId);
      console.log('HURRAY', message.get('id'));
    }
  }
});
