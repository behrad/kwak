import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  messages: DS.hasMany('message'),
  channel: DS.belongsTo('channel'),
  is_locked: DS.attr('boolean'),
});
