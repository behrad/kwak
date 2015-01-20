import Ember from 'ember';

export default Ember.Route.extend({
  model: function (params) {
    return Ember.RSVP.hash({
      penpal: this.store.find('profile', {email: params.email}),
      pms: this.store.find('pm', {email: params.email})
    });
  },

  setupController: function (controller, model) {
    this._super(controller);

    controller.set('model', model.pms);

    controller.set('penpal', model.penpal.objectAt(0));
  },

});
