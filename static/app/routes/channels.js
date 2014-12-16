import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function() {
    return Ember.RSVP.hash({
      channels: this.store.find('channel', {subscribed: true}),
      profile: this.store.find('profile', 'current'),
    });
  },

  setupController: function(controller, model) {
    controller.set('model', model.channels);
    this.controllerFor('profile').set('model', model.profile);
  },
});
