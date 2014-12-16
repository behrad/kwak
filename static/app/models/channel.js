import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  name: DS.attr('string'),
  topics: DS.hasMany('topic'),
  subscribed: DS.attr('boolean'),
});
