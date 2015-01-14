import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return Ember.RSVP.hash({
      channels: this.store.find('channel'),
      profile: this.store.find('profile', 'current'),
    });
  },

  setupController: function (controller, model) {
    this._super(controller);
    controller.set('channels', model.channels);
  },

  afterModel: function (model) {
    if (! model.profile.get('is_admin')) {
      this.transitionTo('channels');
    }
  }
});
