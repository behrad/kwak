import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function (evt) {
    var $target = $(evt.target);
    $target.parents('.message').find('.message-body').toggle();
    $target.select('i').toggleClass('glyphicon-minus');
    $target.select('i').toggleClass('glyphicon-plus');
  }
});
