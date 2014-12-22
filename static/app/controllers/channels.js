import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,

  subscribe: function() {
    var channels = this.get('content').filterProperty('subscribed', true);
    for (var i = 0; i < channels.length; i++) {
      this.socket.emit('join', channels[i].id);
    }
  }.property(),

  subscribed: function() {
    this.get('subscribe');
    return this.get('arrangedContent').filterProperty('subscribed', true);
  }.property('model.@each.subscribed'),

});
