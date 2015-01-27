import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:channels/subscribe', 'ChannelsSubscribeController', {
  // Specify the other units that are required for this test.
  needs: ['controller:profile', 'controller:channels/channel/mark-as-read']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
