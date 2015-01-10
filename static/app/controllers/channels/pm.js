import Ember from 'ember';

var $ = Ember.$;

function scroll () {
  var seens = $('div.message.seen');
  var unseens = $('div.message:not(.seen)');
  var position;
  if (unseens.length) {
    console.log('a');
    position = unseens.eq(0).position().top-150;
  } else if (seens.length) {
    console.log(seens.eq(-1).position());
    position = seens.eq(-1).position().top+150;
  } else {
    console.log('c');
    position = $('.message-list').height();
  }
  $(window).scrollTop(position);
}

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
        Ember.run.scheduleOnce('afterRender', this, scroll);
      });

      this.set('message', '');
    },

    setupMessagebox: function() {},

  },

});
