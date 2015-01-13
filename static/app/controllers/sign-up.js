import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations.Mixin, {
  actions: {
    signUp: function () {
      var self = this;

      var uid = self.get('model.uid');

      this.validate().then(function() {
        var data = self.getProperties('identification', 'firstName', 'lastName', 'password');
        data['uid'] = uid;
        Ember.$.post('api/users/', { user: data }, function() {
          self.transitionToRoute('login');
        }).fail(function (jqxhr) {
          if (jqxhr.status === 409) {
            var errs = JSON.parse(jqxhr.responseText);
            if (errs.error) {
              self.set('eidentification', errs.error);
            } else if (errs.emailError) {
              self.set('eemail', errs.emailError);
            } else {
              self.set('eidentification', 'something bad happened');
            }
          }
        });
      }).catch(function () {
        // validation failed
        for (var prop in self.errors) {
          if (self.errors.hasOwnProperty(prop)) {
            self.set('e'+prop, self.errors[prop][0]);
          }
        }
        return;
      });
    }
  },
  validations: {
    identification: {
      presence: true,
      length: { minimum: 3, messages: { tooShort: 'should be more than 2 characters' } },
      format: { with: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, allowBlank: false, message: 'must be a valid email address' }
    },
    firstName: {
      presence: true,
      length: { minimum: 3, messages: { tooShort: 'should be more than 2 characters' } }
    },
    lastName: {
      presence: true,
      length: { minimum: 3, messages: { tooShort: 'should be more than 2 characters' } }
    },
    password: {
      presence: true,
      length: { minimum: 6, messages: { tooShort: 'at least 6 characters' } }
    }
  },
});
