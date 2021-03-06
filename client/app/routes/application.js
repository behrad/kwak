import Ember from 'ember';
import ApplicationRouteMixin from 'simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, {
  actions: {
    sessionAuthenticationFailed: function(/*error*/) {
      this.controllerFor('login').set('loginErrorMessage', 'login failed');
    }
  }
});
