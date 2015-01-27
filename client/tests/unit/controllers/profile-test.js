import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:profile', 'ProfileController', {
  needs: ['controller:channels/channel/mark-as-read', 'controller:profiles', 'controller:channels']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
