import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:channels/pm', 'ChannelsPmController', {
  // Specify the other units that are required for this test.
  needs: ['controller:profile', 'controller:profiles', 'controller:channels/channel/mark-as-read', 'controller:channels']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
