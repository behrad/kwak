import Ember from 'ember';

var $ = Ember.$;

export default Ember.ObjectController.extend({
  needs: ['profile', 'channels'],
  actions: {
    markAsRead: function (messageId) {
      var self = this;
      if (messageId) {
        self.store.find('message', messageId).then(function (message) {
          var currentUser = self.get('controllers.profile.model');
          currentUser.set('cursor', messageId);
          window.cursor = messageId;
          window.saveRead = window.saveRead || [];
          window.saveRead.push(messageId);

          Ember.run.debounce(self, self.get('controllers.channels').saveRead, 1500);

          Ember.Logger.debug('TODO: save somehow. Read:', messageId);

          message.set('seen', true);
        });
      }
    }
  }
});
