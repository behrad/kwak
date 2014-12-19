import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import socketMixin from 'ember-websockets/mixins/sockets';

export default Ember.Route.extend(AuthenticatedRouteMixin, socketMixin, {
  socketURL: 'ws://echo.websocket.org',
  keepSocketAlive: true,

  model: function() {
    return Ember.RSVP.hash({
      channels: this.store.find('channel'),
      profile: this.store.find('profile', 'current'),
    });
  },

  setupController: function(controller, model) {
    this._super(controller);
    controller.set('model', model.channels);
    this.controllerFor('profile').set('model', model.profile);
  },
});
