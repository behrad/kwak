import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return {
      channels: this.store.find('channel')
    };
  }
});
