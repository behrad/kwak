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

  teams: function () {
    return this.store.all('team');
  }.property(),

  hasMultipleTeams: function() {
    return this.get('teams.length') > 1;
  }.property('teams.length'),

  actives: function () {
    var self = this;
    return this.get('profiles').filter(function (profile) {
      return profile.get('name') && profile.get('is_active') && profile.get('id') !== self.get('currentUser.model.id');
    }).sortBy('name');
  }.property('profiles.@each.is_active'),

  inactives: function () {
    return this.get('profiles').filterBy('is_active', false).sortBy('name');
  }.property('profiles.@each.is_active'),

  actions: {
    toggleActive: function (id, is_active) {
      this.store.find('profile', id).then(function (profile) {
        profile.set('is_active', !is_active);
        profile.save();
      });
    },
    toggleDefault: function (id, is_default) {
      this.store.find('channel', id).then(function (channel) {
        channel.set('is_default', !is_default);
        channel.save();
      });
    },
  }
});
