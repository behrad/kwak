import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['profile', 'profiles', 'channels/channel/mark-as-read'],
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  sortProperties: ['id'],
  sortAscending: true,
  sortFunction: function (a, b) {
    return +a > +b ? 1 : -1;
  },

  init: function () {
    this._super();
    var controller = this.get('controllers.channels/channel/mark-as-read');
    if (controller) {
      controller.send('recountUnread');
    }
  },

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]').on('init'),

  actions: {

    createPM: function () {
      mixpanel.track("new pm", "pm");
      var self = this;

      var content = this.get('message');
      if (!content.trim()) { return; }

      this.store.createRecord('pm', {
        author: this.get('currentUser.model'),
        pubdate: new Date(),
        penpal: this.get('penpal'),
        content: this.get('message')
      }).save().then(function (pm) {
        pm.set('seen', true);
        var model = self.get('model.arrangedContent').toArray();
        model.push(pm);
        self.set('model.arrangedContent', model);
        Ember.run.scheduleOnce('afterRender', self, scroll);
      });

      this.set('message', '');
    },

    markAsRead: function (messageId, type) {
      var controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('markAsRead', messageId, type);
      }
    },

    recountUnread: function () {
      var controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('recountUnread');
      }
    },

    setupMessagebox: function() {},

  },

});
