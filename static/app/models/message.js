import DS from 'ember-data';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('profile', {async: true}),
  topic: DS.belongsTo('topic', {async: true}),
  content: DS.attr('string'),
  seenBy: DS.belongsTo('profile', {async: true}),
});
