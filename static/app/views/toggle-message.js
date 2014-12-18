import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function(evt) {
    $(evt.target).parents('.message').find('.message-body').toggle();
  }
});
