import Ember from 'ember';

export default Ember.Route.extend({
  model: function () {
    return Ember.RSVP.hash({
      channels: this.store.find('channel'),
      profile: this.store.find('profile', 'current'),
      profiles: this.store.find('profile')
    });
  },

  setupController: function (controller, model) {
    this._super(controller);
    controller.set('profiles', model.profiles);
  },

  afterModel: function (model) {
    if (! model.profile.get('is_admin')) {
      this.transitionTo('channels');
    }
  }
});
