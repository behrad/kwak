import DS from 'ember-data';

var RESTAdapter = DS.RESTAdapter.extend({
  namespace: 'api',
});

export default RESTAdapter;
