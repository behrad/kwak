import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:channels/channel/mark-as-read', 'ChannelsChannelMarkAsReadController', {
  // Specify the other units that are required for this test.
  needs: ['controller:profile', 'controller:profiles', 'controller:channels']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
