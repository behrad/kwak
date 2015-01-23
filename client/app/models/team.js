import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  users_can_change_names: DS.attr('boolean'),
  paid_for_users: DS.attr('number'),
  uid: DS.attr('string'),
});
