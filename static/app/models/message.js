import DS from 'ember-data';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('user'),
  channel: DS.belongsTo('channel'),
  content: DS.attr('string')
});
