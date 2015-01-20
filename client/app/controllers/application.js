import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'simple-auth-authenticator:token',
  init: function () {
    var now = new Date();

    if (! window.localStorage.hasOwnProperty('timestamp')) {
      window.localStorage['timestamp'] = now.getTime();
    }

    if (now.getTime() - window.localStorage['timestamp'] > 30000) {
      window.localStorage['timestamp'] = now.getTime();
      window.location.reload();
    }
  },
  actions: {
    reload: function () {
      window.location.reload();
    },
  },
});
