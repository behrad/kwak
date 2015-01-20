import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    if (params.uid) {
      return Ember.$.getJSON('/api/teams/?uid='+params.uid);
    } else {
      return;
    }
  }
});
