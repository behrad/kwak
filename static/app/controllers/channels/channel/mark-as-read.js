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
          message.set('seen', true);
        });
      }
    },
    recountUnread: function () {
      var channels = this.get('controllers.channels.model.content');
      $(channels).each(function (idx, el) {
        var topics = el.get('topics');
        var unreadMessages;
        var count = 0;
        for (var i = 0; i < topics.get('length'); i++) {
          unreadMessages = topics.objectAt(i).get('messages').filterBy('seen', false);
          count += unreadMessages.get('length');
        }
        el.set('unread', count);
      });
    }
  }
});
