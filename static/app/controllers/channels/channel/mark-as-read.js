import Ember from 'ember';

var $ = Ember.$;

export default Ember.ObjectController.extend({
  needs: ['profile', 'profiles', 'channels'],
  actions: {
    markAsRead: function (messageId, type) {
      type = type || 'message';
      var self = this;
      if (messageId) {
        self.store.find(type, messageId).then(function (message) {
          var currentUser = self.get('controllers.profile.model');
          currentUser.set('cursor', messageId);
          window.saveRead = window.saveRead || [];
          window.saveRead.push({
            'id': messageId,
            'type': type,
          });

          Ember.run.debounce(self, self.get('controllers.channels').saveRead, 2500);
          message.set('seen', true);
        });
      }
    },

    recountUnread: function () {
      /* channels part (messages) */
      var totalMsgs = 0;
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
        totalMsgs = totalMsgs + count;
        el.set('unread', count);
      });

      /* users part (PM) */
      var totalPm = 0;
      var profiles = this.get('controllers.profiles.model.content');

      $.getJSON('/api/pms/unread', function (unreadPms) {
        $(profiles).each(function (idx, el) {
          var count = 0;
          if (unreadPms.hasOwnProperty(el.get('id'))) {
            count = unreadPms[el.get('id')];
          }
          if (el.get('unreadPm') !== count) {
            $('.unread-pm-counter[data-profile-id='+el.id+']').addClass('label-warning');
          }
          if (count === 0) {
            $('.unread-pm-counter[data-profile-id='+el.id+']').removeClass('label-warning');
          }
          el.set('unreadPm', count);
          totalPm = totalPm + count;

          if (totalMsgs === totalPm && totalPm === 0) {
            document.title = "(0) kwak";
          } else {
            document.title = "("+totalMsgs+"+"+totalPm+") kwak";
          }
        });
      });
    }
  }
});
