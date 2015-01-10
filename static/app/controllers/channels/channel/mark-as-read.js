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
          window.saveRead = window.saveRead || [];
          window.saveRead.push(messageId);

          Ember.run.debounce(self, self.get('controllers.channels').saveRead, 2500);
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
          var topic = topics.objectAt(i);
          if (topic.get('channel.subscribed')) {
            unreadMessages = topic.get('messages').filterBy('seen', false);
            count += unreadMessages.get('length');
          }
        }
        if (el.get('unread') !== count) {
          $('.unread-counter[data-channel-id='+el.id+']').addClass('label-warning');
        }
        if (count === 0) {
          $('.unread-counter[data-channel-id='+el.id+']').removeClass('label-warning');
        }
        el.set('unread', count);
      });
    }
  }
});
