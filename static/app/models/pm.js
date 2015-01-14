import DS from 'ember-data';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('profile', {async: true}),
  penpal: DS.belongsTo('profile', {async: true}),
  content: DS.attr('string'),
  contentHtml: function () {
    var converter = new window.Showdown.converter({ extensions: ['github'] });
    // re colorize whenever we recompute the value
    return converter.makeHtml(this.get('content'));
  }.property('content'),
  seen: DS.attr('boolean', {defaultValue: false}),
});
