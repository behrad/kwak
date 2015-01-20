import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {

  model: function () {
    return Ember.RSVP.hash({
      channels: this.store.find('channel'),
      profile: this.store.find('profile', 'current'),
      profiles: this.store.find('profile'),
      messages: this.store.find('message'),
    });
  },

  setupController: function (controller, model) {
    this._super(controller);
    controller.set('model', model.channels);

    this.controllerFor('profile').set('model', model.profile);

    this.controllerFor('profiles').set('model', model.profiles);

    // to display email address in header
    this.controllerFor('application').set('model', model.profile);

    // put messages on channels index, this way they don't ever get reloaded
    this.controllerFor('channels/index').set('model', model.messages);
  },

  afterModel: function (model) {
    var channels = model.channels.filterProperty('subscribed', true);
    var channels_ids = [];
    var self = this;

    this.socket.emit('profile', model.profile);
    for (var i = 0; i < channels.length; i++) {
      channels_ids.push(channels[i].id);
      this.socket.emit('join', channels[i].id);
    }
    this.socket.emit('join', 'pm');

    self.socket.emit('profiles', channels_ids);
    setInterval(function () {
      self.socket.emit('profiles', channels_ids);
    }, 15000);

    mixpanel.identify(model.profile.get('id'));
    mixpanel.people.set({
      "$name": model.profile.get('name'),
      "$last_login": new Date(),
      "$email": model.profile.get('email'),
      "$is_admin": model.profile.get('is_admin'),
      "$email_on_mention": model.profile.get('email_on_mention'),
      "$email_on_pm": model.profile.get('email_on_pm'),
    });

  },

});
