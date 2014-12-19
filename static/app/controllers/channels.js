import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortProperties: ['name'],
  sortAscending: true,

  subscribed: function() {
    return this.get('arrangedContent').filterProperty('subscribed', true);
  }.property('model.@each.subscribed'),

  actions: {
    onopen: function(socketEvent) {
      console.log('Websocket connected');
    },
    onmessage: function(socketEvent) {
      console.log('On message has been called!', socketEvent.data);
    },
    onerror: function(socketEvent) {
      console.log('WS Error');
    },
    onclose: function(socketEvent) {
      console.log('WS closed');
    }
  }
});
