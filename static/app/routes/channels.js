import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  model: function () {
    return Ember.RSVP.hash({
      channels: this.store.find('channel'),
      profile: this.store.find('profile', 'current'),
    });
  },

  setupController: function (controller, model) {
    this._super(controller);
    controller.set('model', model.channels);
    this.controllerFor('profile').set('model', model.profile);
  },

  afterModel: function (model) {
    var channels = model.channels.filterProperty('subscribed', true);
    for (var i = 0; i < channels.length; i++) {
      this.socket.emit('join', channels[i].id);
    }
  }
});
