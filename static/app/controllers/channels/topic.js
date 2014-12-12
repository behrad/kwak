import Ember from 'ember';


export default Ember.ObjectController.extend({
  actions: {
    createMessage() {
      var msg = this.get('message');

      //TODO fix this mess
      var aSampleTopic = this.store.getById('topic', 3);
      var aSampleUser = this.store.getById('user', 1);


      var message = this.store.createRecord('message', {
        content: msg,
        topic: aSampleTopic,
        author: aSampleUser
      });

      message.save();
    }
  }
});
