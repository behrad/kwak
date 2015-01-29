import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['profile', 'channels/channel', 'channels/channel/index', 'channels/channel/topic'],
  currentUser: Ember.computed.alias('controllers.profile'),
  actions: {
    createMessage: function (channel, content, topicTitle) {

      var self = this;
      self.store.find('topic', {title: topicTitle, channel_id: channel.id}).then(function (topics) {
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
                Ember.run.scheduleOnce('afterRender', self, scroll);
                mixpanel.track("edit message");
                message.set('seen', true);
                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
              });
            } else {
              // create new message in existing topic
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function (message) {
                message.set('seen', true);
                Ember.run.scheduleOnce('afterRender', self, scroll);
                mixpanel.track("new message");
                self.get('flashes').success('Message posted!');

                var channelsChannelIndex = self.get('controllers.channels/channel/index.model.messages');
                if (channelsChannelIndex) {
                  channelsChannelIndex.pushObject(message);
                }

                var channelsChannelTopic = self.get('controllers.channels/channel/topic.model.messages');
                if (channelsChannelTopic) {
                  channelsChannelTopic.pushObject(message);
                }

                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
              });
            }
          });
        } else {
          // create topic
          self.store.createRecord('topic', {
            title: topicTitle,
            channel: channel
          }).save().then(function (topic) {
            // create message in new topic
            mixpanel.track("new topic");
            topic.get('messages').createRecord({
              content: content,
              author: self.get('currentUser.model'),
            }).save().then(function (message) {
              message.set('seen', true);
              message.get('topic').then(function (topic) {
                Ember.run.scheduleOnce('afterRender', self, scroll);
                mixpanel.track("new message");
                self.get('flashes').success('Message posted!');
                Ember.run.scheduleOnce('afterRender', self, messageAfterRender);
                self.transitionToRoute('channels.channel.topic', topic);
              });
            });
          });
        }
      });
    },

  }
});
