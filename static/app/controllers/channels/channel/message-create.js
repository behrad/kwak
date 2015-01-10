import Ember from 'ember';

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

export default Ember.ObjectController.extend({
  needs: ['profile', 'channels/channel'],
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
              var message = topic.get('messages.lastObject');
              message.set('content', message.get('content') + "\n\n" + content);
              message.save().then(function (message) {
                Ember.run.scheduleOnce('afterRender', this, scroll);
                window.prettyPrint();
                mixpanel.track("edit message", "append");
                message.set('seen', true);
              });
            } else {
              // create new message in existing topic
              topic.get('messages').createRecord({
                content: content,
                author: self.get('currentUser.model')
              }).save().then(function (message) {
                message.set('seen', true);
                Ember.run.scheduleOnce('afterRender', this, scroll);
                window.prettyPrint();
                mixpanel.track("new message");
                self.get('controllers.channels/channel.messages').pushObject(message);
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
                Ember.run.scheduleOnce('afterRender', this, scroll);
                window.prettyPrint();
                mixpanel.track("new message");
                self.get('controllers.channels/channel.messages').pushObject(message);
                self.transitionToRoute('channels.channel.topic', topic);
              });
            });
          });
        }
      });
    },

  }
});
