import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  topics: DS.hasMany('topic'),
  subscribed: DS.attr('boolean'),
  save: function(){
    return this._super();
  }
});
