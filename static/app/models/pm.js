import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  pubdate: DS.attr('date'),
  author: DS.belongsTo('profile', {async: true}),
  penpal: DS.belongsTo('profile', {async: true}),
  content: DS.attr('string'),
  contentHtml: function () {
    var converter = new window.Showdown.converter({ extensions: ['github'] });
    // re colorize whenever we recompute the value
    Ember.run.scheduleOnce('afterRender', this, function () {
      window.prettyPrint();
    });
    return converter.makeHtml(this.get('content'));
  }.property('content'),
  seen: DS.attr('boolean', {defaultValue: false}),
});
