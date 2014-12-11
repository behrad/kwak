import DS from 'ember-data';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('user', {async: true}),
  channel: DS.belongsTo('channel', {async: true}),
  content: DS.attr('string')
});
