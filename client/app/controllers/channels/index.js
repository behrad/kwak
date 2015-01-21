import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['profile', 'profiles', 'channels', 'channels/pm', 'channels/channel/index', 'channels/channel/mark-as-read'],
  currentUser: Ember.computed.alias('controllers.profile'),
  profiles: Ember.computed.alias('controllers.profiles'),

  sortProperties: ['id'],
  sortAscending: true,
  sortFunction: function (a, b) {
    return +a > +b ? 1 : -1;
  },

  _scroll: function () {
    Ember.run.scheduleOnce('afterRender', this, scroll);
  }.observes('model.[]'),

  subscribed: function () {
    return this.get('arrangedContent').filterBy('topic.channel.subscribed', true);
  }.property('model.@each.topic.channel.subscribed'),

  actions: {
    tour: function () {
      var is_admin = this.get('currentUser.is_admin');
      var tour = new Shepherd.Tour({
        defaults: {
          classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
          showCancelLink: true
        }
      });
      tour.addStep('welcome', {
        text: ['This is the kwak logo. Clicking on it will always take you home'],
        attachTo: '.navbar-brand right',
      });
      tour.addStep('tags', {
        text: ['This "tags" icon is the place to be to subscribe to channels that are interesting to you.', 'You can also use it to create new channels.'],
        attachTo: '.glyphicon-tags right',
      });
      tour.addStep('channels-list', {
        text: ['This is the channels list.', 'The channels you are subscribed to are displayed here.'],
        attachTo: '.channels right',
      });
      tour.addStep('message-list', {
        text: ['Here is the message list. It displays the messages from all your channels.', 'Once you have messages here, you\'ll see how easy it is to narrow the view to a specific channel or to a topic.', 'Messages are written using the Markdown syntax.'],
        attachTo: '.message-list top',
      });
      tour.addStep('markdown', {
        text: ['If you ever need help with the Markdown syntax used to format messages, this button is here to help'],
        attachTo: '.btn-help top',
      });
      tour.addStep('connected', {
        text: ['This side panel shows the list of your team\'s users.', 'Connected users will be shown in blue at the top of the list.'],
        attachTo: '.connected left',
      });
      tour.addStep('profile', {
        text: ['Your user settings.'],
        attachTo: '.profile-settings bottom',
      });
      if (is_admin) {
        tour.addStep('admin', {
          text: ['The admin panel. Use it to add users to your team or to define default channels for your team.'],
          attachTo: '.admin-panel bottom',
        });
      }
      tour.addStep('feedback', {
        text: ['Use this feedback form in case you ever encounter a bug, or if you have a question or want to say something nice. :)'],
        attachTo: '.btn-feedback top',
      });
      tour.addStep('end', {
        text: ['This is the end of our tour. Time to start using kwak!'],
        attachTo: '.message-list top',
      });

      tour.start();
    },
    createMessage: function () {
      mixpanel.track("new message", "channels/index");
      var content = this.get('message');
      if (!content.trim()) { return; }

      var channelId = this.get('channel');

      var topicTitle = this.get('topicTitle');
      if (!topicTitle.trim()) { return; }

      var self = this;
      this.store.find('topic', {title: topicTitle, channel_id: channelId}).then(function (topics) {
        var topic = topics.get('lastObject');
        if (topic) {
          Ember.$.getJSON('/api/messages/last', function (data) {
            var last_message_posted_by = data['message']['author_id'];
            var last_topic_posted_in = data['message']['topic_id'];

            if (+topic.id === last_topic_posted_in && +self.get('currentUser.model.id') === last_message_posted_by) {
              // append to last message
              var message = topic.get('messages.lastObject');
              message.set('content', message.get('content') + "\n\n" + content);
              message.save().then(function (message) {
                mixpanel.track("edit message", "append");
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
            self.store.createRecord('topic', {
              id: data.id,
              title: data.title,
              channel: channel
            });
          });
        }
      }, 1000);
    },

    message: function (data) {
      var now = new Date();
      window.localStorage['timestamp'] = now.getTime();
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
              var message = self.store.createRecord('message', {
                id: data.id,
                content: data.content,
                topic: topic,
                author: author
              });

              var channelIndex = self.get('controllers.channels/channel/index.messages');
              if (channelIndex) {
                channelIndex.pushObject(message);
              }

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
