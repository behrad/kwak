import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  color: DS.attr('string'),
  topics: DS.hasMany('topic'),
  team: DS.belongsTo('team'),
  subscribed: DS.attr('boolean'),
  unread: function () {
    var cursor = 25;
    var topics = this.get('topics');
    var messages;
    var ids = [];
    for (var i = 0; i < topics.get('length'); i++) {
      messages = topics.objectAt(i).get('messages');
      for (var j = 0; j < messages.get('length'); j++) {
        ids.push(messages.objectAt(j).get('id'));
      }
    }
    return ids.filter(function(i) { return i > cursor; }).length;
  }.property('profile.cursor')
});
