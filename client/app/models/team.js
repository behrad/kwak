import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  users_can_change_names: DS.attr('boolean'),
  is_paying: DS.attr('boolean'),
  uid: DS.attr('string'),
});
