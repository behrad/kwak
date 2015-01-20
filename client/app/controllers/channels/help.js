import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['channels/channel/mark-as-read'],

  init: function () {
    this._super();
    var controller = this.get('controllers.channels/channel/mark-as-read');
    if (controller) {
      controller.send('recountUnread');
    }
  },

});
