import Ember from 'ember';

export default Ember.ArrayController.extend({
  sortProperties: ['id'],
  sortAscending: true,
  sortFunction: function(a, b) {
    return +a > +b ? 1 : -1;
  }
});
