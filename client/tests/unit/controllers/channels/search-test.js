import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:channels/search', 'ChannelsSearchController', {
  // Specify the other units that are required for this test.
  needs: ['controller:profile', 'controller:channels', 'controller:channels/channel/mark-as-read', 'controller:profiles']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
