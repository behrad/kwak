import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('topic', 'Topic', {
  // Specify the other units that are required for this test.
  needs: ['model:channel', 'model:message', 'model:user']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
