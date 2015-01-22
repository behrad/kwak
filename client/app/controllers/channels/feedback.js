import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'channels/channel/mark-as-read'],
  currentUser: Ember.computed.alias('controllers.profile'),

  init: function () {
    this._super();
    var controller = this.get('controllers.channels/channel/mark-as-read');
    if (controller) {
      controller.send('recountUnread');
    }
  },

  actions: {
    sendFeedback: function () {
      var content = this.get('feedbackMessage');
      var self = this;

      Ember.$.post('api/feedback/', { feedback: content }, function () {
        self.set('sent', true);
      });
    },
  },

});
