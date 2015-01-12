import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,

  subscribed: function () {
    return this.get('arrangedContent').filterProperty('subscribed', true);
  }.property('model.@each.subscribed'),

  saveRead: function () {
    Ember.$.post('/api/messages/read', JSON.stringify(window.saveRead));
    window.saveRead = [];
  },

  teams: function () {
    return this.store.all('team');
  }.property(),

  hasMultipleTeams: function() {
    return this.get('teams.length') > 1;
  }.property('teams.length'),

  actions: {
    pm: function (profile) {
      var email;
      if(profile.email) {
        email = profile.email;
      } else {
        email = profile.get('email');
      }
      // URL instead of route, to force the route to reload models
      this.transitionToRoute('/channels/pm/' + email);
    }
  },

});
