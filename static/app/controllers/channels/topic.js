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

      /**

      1/ Get or create a Topic named topic_title in Channel channel_id
      2/ Get the currently logged in User
      3/ Save the message
      4/ Update the view ?

      */

      var topic = '';
      var user = '';

      var message = this.store.createRecord('message', {
        content: content,
        topic: topic,
        author: user
      });

      this.set('message', '');

      message.save();


    }
  }
});
