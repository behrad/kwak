import Ember from 'ember';
import BindScrollMixin from 'static/mixins/bind-scroll';

module('BindScrollMixin');

// Replace this with your real tests.
test('it works', function() {
  var BindScrollObject = Ember.Object.extend(BindScrollMixin);
  var subject = BindScrollObject.create();
  ok(subject);
});
