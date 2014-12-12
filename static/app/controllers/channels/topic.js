import Ember from 'ember';


export default Ember.ObjectController.extend({
  actions: {
    createMessage() {
      var content = this.get('message');
      if (!content.trim()) { return; }

      var channel_id = this.get('topic.channel.id');
      if (!channel_id.trim()) { return; }

      var topic_title = this.get('topic.title');
      if (!topic_title.trim()) { return; }

      //TODO fix this mess
      var aSampleTopic = this.store.getById('topic', 3);
      //TODO this is supposed to be the *current* user
      var aSampleUser = this.store.getById('user', 1);


      var message = this.store.createRecord('message', {
        content: content,
        topic: aSampleTopic,
        author: aSampleUser
      });

      this.set('message', '');

      message.save();

    }
  }
});
