import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    return Ember.$.getJSON('/api/teams/?uid='+params.uid);
  }
});
