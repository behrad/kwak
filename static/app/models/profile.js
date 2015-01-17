import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  email: DS.attr('string'),
  cursor: DS.attr('number'),
  teams: DS.hasMany('team'),
  is_admin: DS.attr('boolean'),
  is_active: DS.attr('boolean', {defaultValue: true}),
  unreadPm: function () {
    return '';
  }.property()
});
