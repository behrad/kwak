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

  actives: function () {
    var self = this;
    return this.get('profiles').filterBy('is_active', true).filter(function (profile) {
      return profile.get('id') !== self.get('currentUser.model.id');
    });
  }.property('profiles.@each.is_active'),

  inactives: function () {
    return this.get('profiles').filterBy('is_active', false);
  }.property('profiles.@each.is_active'),

  actions: {
    toggleActive: function (id, is_active) {
      this.store.find('profile', id).then(function (profile) {
        profile.set('is_active', !is_active);
        profile.save();
      });
    },
  }
});
