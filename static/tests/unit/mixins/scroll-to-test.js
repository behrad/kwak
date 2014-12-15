import Ember from 'ember';
import ScrollToMixin from 'static/mixins/scroll-to';

module('ScrollToMixin');

// Replace this with your real tests.
test('it works', function() {
  var ScrollToObject = Ember.Object.extend(ScrollToMixin);
  var subject = ScrollToObject.create();
  ok(subject);
});
