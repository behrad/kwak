import Ember from 'ember';

export default Ember.ObjectController.extend({
  subscribed: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      return model.get('subscribed');
    } else {
      model.set('subscribed', value);
      model.save();
      return value;
    }
  }.property('model.subscribed')
});
