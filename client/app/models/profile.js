import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  email: DS.attr('string'),
  teams: DS.hasMany('team'),
  is_admin: DS.attr('boolean'),
  email_on_mention: DS.attr('boolean'),
  email_on_pm: DS.attr('boolean'),
  hide_tour: DS.attr('boolean'),
  is_active: DS.attr('boolean', {defaultValue: true}),
  unreadPm: function () {
    return '';
  }.property()
});
