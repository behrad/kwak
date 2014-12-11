import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return {
      messages: this.store.find('message'),
      channels: this.store.find('channel')
    };
  }
});
