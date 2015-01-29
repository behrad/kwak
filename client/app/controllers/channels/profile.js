import Ember from 'ember';

var $ = Ember.$;

export default Ember.Controller.extend({

  canSave: function () {
    return this.get('canChangeName');
  }.property(),

  canChangeName: function () {
    var canChangeName = true;
    var teams = this.get('model.profile.teams.content');
    $(teams).each(function(index, val) {
       if (val.get('users_can_change_names') === false) {
        canChangeName = false;
       }
    });
    return canChangeName;
  }.property(),

  mentionOn: function () {
    return this.get('model.profile.email_on_mention');
  }.property().volatile(),

  pmOn: function () {
    return this.get('model.profile.email_on_pm');
  }.property().volatile(),

  actions: {
    toggleMention: function () {
      var self = this;
      var profile = this.get('model.profile');
      var newVal = ! profile.get('email_on_mention');
      profile.set('email_on_mention', newVal);
      profile.save().then(function () {
        self.set('mentionOn', self.get('model.profile.email_on_mention'));
      });
    },
    togglePM: function () {
      var self = this;
      var profile = this.get('model.profile');
      var newVal = ! profile.get('email_on_pm');
      profile.set('email_on_pm', newVal);
      profile.save().then(function () {
        self.set('pmOn', self.get('model.profile.email_on_pm'));
      });
    },
    updateName: function (name) {
      var profile = this.get('model.profile');
      profile.set('name', name);
      profile.save();
    }
  }

});
