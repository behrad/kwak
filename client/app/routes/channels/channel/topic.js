import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    return Ember.RSVP.hash({
      messages: this.modelFor('channels').messages.filter(function (message) {
        return message.get('topic.id') === params.topic_id;
      }).sort(function (a, b) {
        return +a.get('id') - +b.get('id');
      }),
      topic: this.store.find('topic', params.topic_id),
    });
  },

  serialize: function (model) {
    return {
      topic_id: model.get('id'),
      topic_title: model.get('title'),
    };
  },
});
