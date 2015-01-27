import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:channels/feedback', 'ChannelsFeedbackController', {
  // Specify the other units that are required for this test.
  needs: [ 'controller:profile', 'controller:channels/channel/mark-as-read', 'controller:profiles', 'controller:channels' ]
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
