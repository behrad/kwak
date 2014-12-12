import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return {
      topic: this.store.find('topic', params.topic_id),
      messages: this.store.find('message', {'topic_id': params.topic_id}),
      channels: this.store.find('channel')
    };
  }
});
