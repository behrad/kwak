import Ember from 'ember';


export default Ember.ObjectController.extend({
  actions: {
    createMessage() {
      var msg = this.get('message');

      var message = this.store.createRecord('message', {
        content: msg,
        topic: this.store.find('topic', 1),
        author: this.store.find('user', 1)
      });
      message.save();
    }
  }
});
