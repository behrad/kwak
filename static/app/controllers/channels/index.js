import Ember from 'ember';

export default Ember.ObjectController.extend({
  model: 'channels',
  sortProperties: ['name'],
  sortAscending: true
});
