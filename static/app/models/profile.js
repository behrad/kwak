import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  email: DS.attr('string'),
  cursor: DS.attr('number'),
  unreadPm: function () {
    return '∞';
  }.property()
});
