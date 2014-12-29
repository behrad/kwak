import Ember from 'ember';

var $ = Ember.$;

export default Ember.ObjectController.extend({
  needs: ['profile'],
  actions: {
    markAsRead: function (messageId) {
      var self = this;
      if (messageId) {
        self.store.find('message', messageId).then(function (message) {
          var currentUser = self.get('controllers.profile.model');
          currentUser.set('cursor', messageId);
          window.cursor = messageId;

          Ember.Logger.debug('TODO: save somehow. Read:', messageId);

          message.set('seen', true);
        });
      }
    }
  }
});
