import DS from 'ember-data';

export default DS.Model.extend({
  username: DS.attr('string'),
  first_name: DS.attr('string'),
  last_name: DS.attr('string'),
  email: DS.attr('string'),
  url: DS.attr('string'),
  is_staff: DS.attr('boolean'),
  fullName: function() {
    var firstName = this.get('first_name');
    var lastName = this.get('last_name');
    return firstName + ' ' + lastName;
  }.property('first_name', 'last_name')
});
