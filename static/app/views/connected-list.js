import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function () {
    var $this = $('.connected');
    if ($(window).width() < 768) {
      var $hide = $('#hide-connected');
      var $list = $('#connected-list');
      $hide.find('span').toggleClass('glyphicon-chevron-right');
      $hide.find('span').toggleClass('glyphicon-chevron-left');
      $list.toggle();
      if ($list.is(':visible')) {
        $this.animate({'right': 0});
        $('.center-container').animate({'margin-right': '200px'});
        $('footer').animate({'right': '200px'});
      } else {
        $this.animate({'right': '-175px'});
        $('.center-container').animate({'margin-right': '20px'});
        $('footer').animate({'right': '34px'});
      }
    }
  }
});
