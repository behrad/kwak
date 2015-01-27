import DS from 'ember-data';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('profile', {async: true}),
  topic: DS.belongsTo('topic', {async: true}),
  content: DS.attr('string'),
  contentHtml: function () {
    var converter = new window.Showdown.converter({ extensions: ['github'] });
    // re colorize whenever we recompute the value
    var raw = this.get('content').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return converter.makeHtml(raw);
  }.property('content'),
  seen: DS.attr('boolean', {defaultValue: false}),
});
