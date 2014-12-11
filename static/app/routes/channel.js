import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return {
      channel: this.store.find('channel', params.channel_id),
      channels: this.store.find('channel')
    };
  }
});
