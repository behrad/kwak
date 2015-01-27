import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:sign-up', 'SignUpController', {
  // Specify the other units that are required for this test.
  needs: [
    'ember-validations@validator:local/presence',
    'ember-validations@validator:local/length',
    'ember-validations@validator:local/format',
  ]
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
