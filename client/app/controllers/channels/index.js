import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'application', 'profiles', 'channels', 'channels/pm', 'channels/channel/index', 'channels/channel/topic', 'channels/channel/mark-as-read'],
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]'),

  subscribed: function () {
    return this.get('model.messages').filterBy('topic.channel.subscribed', true).sort(function (a, b) {

      return +a.get('id') - +b.get('id');
    });
  }.property('model.channels.[]', 'model.messages.[]'),

  actions: {
    tour: function () {
      this.get('controllers.application').send('tour');
    },
    createMessage: function () {
      var content = this.get('message');
      if (!content.trim()) { this.get('flashes').warning('Please enter a message'); return; }

      var channelId = this.get('channel');

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { this.get('flashes').warning('Please enter a topic'); return; }

      var self = this;
      this.store.find('topic', {title: topicTitle, channel_id: channelId}).then(function (topics) {
        var topic = topics.get('lastObject');
        if (topic) {
          Ember.$.getJSON('/api/messages/last', function (data) {
            var last_message_posted_by = data['message']['author_id'];
            var last_topic_posted_in = data['message']['topic_id'];

            if (+topic.id === last_topic_posted_in && +self.get('currentUser.model.id') === last_message_posted_by) {
              // append to last message
              var message = self.store.getById('message', data['message']['id']);
              message.set('content', message.get('content') + "\n\n" + content);
              message.save().then(function (message) {
                mixpanel.track("edit message");
                message.set('seen', true);
                Ember.run.scheduleOnce('afterRender', self, scroll);
                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
              });
            } else {
              // create new message in existing topic
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function (message) {
                mixpanel.track("new message");
                self.get('flashes').success('Message posted!');
                message.set('seen', true);
                self.set('topicCreated', topic.get('id'));
                Ember.run.scheduleOnce('afterRender', self, scroll);
                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
              });
            }
          });
        } else {
          self.store.find('channel', channelId).then(function (channel) {
            // create topic
            self.store.createRecord('topic', {
              title: topicTitle,
              channel: channel
            }).save().then(function (topic) {
              // create message in new topic
              mixpanel.track("new topic");
              self.set('topicCreated', topic.get('id'));
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function (message) {
                mixpanel.track("new message");
                self.get('flashes').success('Message posted!');
                message.set('seen', true);
                Ember.run.scheduleOnce('afterRender', self, scroll);
                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
              });
            });
          });
        }
        self.set('message', '');
      });
    },
    markAsRead: function (messageId) {
      var controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('markAsRead', messageId);
      }
    },
    recountUnread: function () {
      var controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('recountUnread');
      }
    },
    setupMessagebox: function(topicTitle, channelId) {
      this.set('channel', channelId);
      this.set('topicTitle', topicTitle);
    }
  },
  sockets: {
    topic: function (data) {
      var self = this;
      setTimeout(function () {
        if (data.id === self.get('topicCreated')) {
          // It's my own topic coming back like a boomerang
          return;
        }
        if (!self.store.hasRecordForId('topic', data.id)) {
          self.store.find('channel', data.channel).then(function (channel) {
            self.store.push('topic', {
              id: data.id,
              title: data.title,
              channel: channel
            });
          });
        }
      }, 1000);
    },

    message: function (data) {
      var self = this;
      setTimeout(function () {
        if (data.author === self.get('currentUser.id')) {
          // It's my own message coming back like a boomerang
          return;
        }
        if (self.store.hasRecordForId('message', data.id)) {
          var message = self.store.getById('message', data.id);
          message.set('content', data.content);
        } else {
          self.store.find('topic', data.topic).then(function (topic) {
            self.store.find('profile', data.author).then(function (author) {
              self.store.push('message', {
                id: data.id,
                pubdate: data.pubdate,
                content: data.content,
                topic: topic,
                author: author
              });

              var controller = self.get('controllers.channels/channel/mark-as-read');
              if (controller) {
                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
                controller.send('recountUnread');
              }

            });
          });
        }
        Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
        self.send('recountUnread');
      }, 2000);
    },

    profiles: function (profiles) {
      var self = this;
      var activeEmails = [];
      var activeProfiles = profiles.filter(function (profile) {
        var alreadyAdded = (Ember.$.inArray(profile.email, activeEmails) !== -1);
        if (!alreadyAdded) {
          activeEmails.push(profile.email);
          return profile.email !== self.get('currentUser.model.email');
        } else {
          return false;
        }
      });

      var otherProfiles = [];

      this.get('controllers.profiles.arrangedContent').forEach(function (profile) {
        if (profile.id !== 'current') {
          profile = self.store.getById('profile', profile.id);
          if (profile.get('email') !== self.get('currentUser.model.email')) {
            if (Ember.$.inArray(profile.get('email'), activeEmails) === -1) {
              if (profile.get('name')) {
                otherProfiles.push(profile);
              }
            }
          }
        }
      });

      this.get('controllers.channels').set('hasProfiles', this.get('controllers.profiles.arrangedContent.length') !== 0);
      this.get('controllers.channels').set('activeProfiles', activeProfiles);
      this.get('controllers.channels').set('otherProfiles', otherProfiles);
    },

    pm: function (data) {
      var controller = this.get('controllers.channels/pm');
      var model = controller.get('model.arrangedContent');

      var pm = this.store.createRecord('pm', {
        id: data.id,
        content: data.content,
        pubdate: data.pubdate,
        author: this.store.getById('profile', data.author),
        penpal: this.store.getById('profile', data.penpal),
      });
      model = model.toArray();
      if (model.objectAt(0).get('penpal.email') === pm.get('author.email')) {
        model.push(pm);
        controller.set('model.arrangedContent', model);
      }

      controller = this.get('controllers.channels/channel/mark-as-read');
      if (controller) {
        controller.send('recountUnread');
      }

    },

  },
});
