import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  color: DS.attr('string'),
  topics: DS.hasMany('topic'),
  team: DS.belongsTo('team'),
  subscribed: DS.attr('boolean'),
  unread: function () {
    return '∞';
  }.property()
});
