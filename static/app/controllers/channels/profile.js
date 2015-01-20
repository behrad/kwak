import Ember from 'ember';

export default Ember.ObjectController.extend({

  actions: {
    toggleMention: function () {
      console.log(this.get('model.profile.email_on_mention'));
    },
    togglePM: function () {
      console.log(this.get('model.profile.email_on_pm'));
    }
  }

});
