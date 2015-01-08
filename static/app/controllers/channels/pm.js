import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'profiles'],
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  actions: {
    createPM: function () {
      var content = this.get('message');
      if (!content.trim()) { return; }

      var self = this;

      self.store.createRecord('pm', {
        penpal: self.get('penpal'),
        content: self.get('message')
      }).save().then(function (pm) {
        var pms = self.get('model').toArray();
        pms.push(pm);
        self.set('model', pms);
        self.set('message', '');
      });
    },
  },

});
