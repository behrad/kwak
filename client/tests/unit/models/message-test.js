import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('message', 'Message', {
  // Specify the other units that are required for this test.
  needs: ['model:profile', 'model:topic', 'model:team', 'model:channel']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
