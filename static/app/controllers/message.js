import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['profile'],

  actions: {
    editMessage: function () {
      if (this.get('controllers.profile.model.id') === this.get('author.id')) {
        this.set('isEditing', true);
      }
    },
    acceptChanges: function () {
      this.set('isEditing', false);
      this.get('model').save().then(function (message) {
        message.set('seen', true);
      });
    }
  },

  isEditing: false,

});
