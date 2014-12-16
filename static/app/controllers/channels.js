import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,

  subscribed: function() {
    return this.get('arrangedContent').filterProperty('subscribed', true);
  }.property('model.@each.subscribed'),

  unsubscribed: function() {
    return this.get('arrangedContent').filterProperty('subscribed', false);
  }.property('model.@each.subscribed')
});
