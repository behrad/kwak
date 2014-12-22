import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    return Ember.RSVP.hash({
      messages: this.store.find('message', {'channel_id': params.channel_id}),
      channel: this.store.find('channel', params.channel_id)
    });
  },

  serialize: function (model) {
    return {
      channel_id: model.get('id'),
      channel_name: model.get('name'),
    };
  },
});
