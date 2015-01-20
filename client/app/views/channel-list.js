import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function () {
    var $this = $('.channels');
    if ($(window).width() < 768) {
      var $hide = $('#hide-channels');
      var $list = $('#channels-list');
      $hide.find('span').toggleClass('glyphicon-chevron-left');
      $hide.find('span').toggleClass('glyphicon-chevron-right');
      $this.find('h5').toggle();
      $list.toggle();
      if ($list.is(':visible')) {
        /* hide other side */
        $('.connected').animate({'right': '-175px'});
        $('.center-container').animate({'margin-right': '20px'});
        $('.footer').animate({'right': '34px'});

        $this.animate({'left': 0});
        $('.center-container').animate({'margin-left': '200px'});
        $('.footer').animate({'left': '200px'});
      } else {
        $this.animate({'left': '-175px'});
        $('.center-container').animate({'margin-left': '20px'});
        $('.footer').animate({'left': '34px'});
      }
    }
  }
});
