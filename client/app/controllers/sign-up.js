import Ember from 'ember';
import EmberValidations from 'ember-validations';

export default Ember.Controller.extend(EmberValidations.Mixin, {
  wantsNewTeam: function () {
    var wantsNewTeam = (this.get('model') === null);
    if (!wantsNewTeam) {
      this.set('team', this.get('model.name'));
    }
    return wantsNewTeam;
  }.property(),

  actions: {
    signUp: function () {
      var self = this;

      var uid = self.get('model.uid');

      self.validate().then(function() {
        var data;
        if (self.get('wantsNewTeam')) {
          data = self.getProperties('team', 'identification', 'firstName', 'lastName', 'password');
        } else {
          data = self.getProperties('identification', 'firstName', 'lastName', 'password');
          data['uid'] = uid;
        }
        Ember.$.post('api/users/', { user: data }, function () {
          if (data['team']) {
            mixpanel.track("team created");
            mixpanel.track("account created");
          } else {
            mixpanel.track("account created");
          }
          self.set('success', true);
          setTimeout(function () {
            self.transitionToRoute('login');
          }, 15000);
        }).fail(function (jqxhr) {
          var errs = JSON.parse(jqxhr.responseText);
          if (errs.error) {
            self.set('eidentification', errs.error);
          } else if (errs.emailError) {
            self.set('eemail', errs.emailError);
          } else if (errs.eTeam) {
            self.set('eteam', errs.eTeam);
          } else {
            self.set('eidentification', 'something bad happened');
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
    team: {
      presence: true,
      length: { minimum: 3, messages: { tooShort: 'should be more than 2 characters' } }
    },
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
