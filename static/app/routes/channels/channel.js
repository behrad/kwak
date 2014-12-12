import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return {
      messages: this.store.find('message', {'channel_id': params.channel_id}),
      channels: this.store.find('channel'),
      channel: this.store.find('channel', params.channel_id)
    };
  }
});
