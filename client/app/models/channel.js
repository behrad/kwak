import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  color: DS.attr('string'),
  topics: DS.hasMany('topic'),
  team: DS.belongsTo('team'),
  subscribed: DS.attr('boolean'),
  is_default: DS.attr('boolean', {defaultValue: false}),
  unread: function () {
    return '';
  }.property()
});
