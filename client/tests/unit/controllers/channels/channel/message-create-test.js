import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:channels/channel/message-create', 'ChannelsChannelMessageCreateController', {
  // Specify the other units that are required for this test.
  needs: ['controller:profile', 'controller:channels/channel', 'controller:channels/channel/topic']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
