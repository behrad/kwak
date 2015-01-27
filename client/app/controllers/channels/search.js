import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'channels/channel/mark-as-read', 'profiles'],
  currentUser: Ember.computed.alias('controllers.profile'),

  init: function () {
    this._super();
    var controller = this.get('controllers.channels/channel/mark-as-read');
    if (controller) {
      controller.send('recountUnread');
    }
  },

  terms: '',
  limit: false,
  noResult: false,

  actions: {
    search: function () {
      var self = this;
      var formatHtml = function (raw) {
        var converter = new window.Showdown.converter({ extensions: ['github'] });
        raw = raw.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return converter.makeHtml(raw);
      };
      if (self.get('terms') === '') {
        self.set('results', []);
      } else if (self.get('terms.length') < 3) {
        self.set('limit', true);
        self.set('results', []);
      } else {
        self.set('limit', false);
        Ember.$.get('/api/search?q='+this.get('terms'), function(data) {
          data = data['results'];
          var results = [];
          for (var i = 0; i < data.length; i++) {
            results.push({
              topic: data[i]['content'][0],
              topic_id: data[i]['topic_id'],
              channel: data[i]['channel'],
              channel_id: data[i]['channel_id'],
              channel_color: data[i]['channel_color'],
              author: data[i]['content'][1],
              content: formatHtml(data[i]['content'][2]),
              url: data[i]['url'],
              pubdata: data[i]['pubdate'],
            });
          }
          self.set('noResult', results.length === 0);
          self.set('results', results);
        });
      }
    },
  },
});
