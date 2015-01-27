import {
  moduleForModel,
  test
} from 'ember-qunit';

moduleForModel('topic', 'Topic', {
  // Specify the other units that are required for this test.
  needs: ['model:message', 'model:team', 'model:channel', 'model:profile']
});

test('it exists', function() {
  var model = this.subject();
  // var store = this.store();
  ok(!!model);
});
