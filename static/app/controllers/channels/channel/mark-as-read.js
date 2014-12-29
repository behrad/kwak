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

          Ember.Logger.debug('TODO: save somehow. Read:', messageId);

          var channels = self.get('controllers.channels.model.content');
          $(channels).each(function (idx, el) {
            var topics = el.get('topics');
            var messages;
            for (var i = 0; i < topics.get('length'); i++) {
              messages = topics.objectAt(i).get('messages').filterBy('seen', false);
              var count = messages.get('length') - $('div.seen[data-channel-id='+el.get('id')+']').length;
              if (count < 0) {
                count = 0;
              }
              el.set('unread', count);
            }
          });
          message.set('seen', true);
        });
      }
    }
  }
});
