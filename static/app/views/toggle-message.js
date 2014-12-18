import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function(evt) {
    $(evt.target).parent().parent().parent().find('.message-body').toggle();
  }
});
