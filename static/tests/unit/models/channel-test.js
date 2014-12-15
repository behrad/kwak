import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('channel', 'Channel', {
  // Specify the other units that are required for this test.
  needs: ['model:topic', 'model:message']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
