import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params) {
    return this.store.find('topic', params.topic_id);
  },

  serialize: function (model) {
    return {
      topic_id: model.get('id'),
      topic_title: model.get('title'),
    };
  },
});
