import DS from 'ember-data';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('user', {async: true}),
  topic: DS.belongsTo('topic', {async: true}),
  content: DS.attr('string')
});
