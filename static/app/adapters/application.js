import DS from "ember-data";

export default DS.ActiveModelAdapter.extend({
  namespace: 'api',
  buildURL: function(type, id, record){
    return this._super(type, id, record) + '/';
  }
});
