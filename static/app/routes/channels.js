import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return Ember.RSVP.hash({
      channels: this.store.find('channel'),
      user: this.store.find('user', 'current')
    });
  },

  setupController: function(controller, model) {
    controller.set('model', model.channels);
    this.controllerFor('user').set('model', model.user);
  },
});
