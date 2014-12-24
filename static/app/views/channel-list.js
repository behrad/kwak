import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function () {
    var $this = $('.channels');
    if ($(window).width() < 768) {
      var $hideChannels = $('#hide-channels');
      var $channelsList = $('#channels-list');
      $hideChannels.find('span').toggleClass('glyphicon-chevron-left');
      $hideChannels.find('span').toggleClass('glyphicon-chevron-right');
      $this.find('h5').toggle();
      $channelsList.toggle();
      if ($channelsList.is(':visible')) {
        $this.animate({'left': 0});
        $('.right-container').animate({'margin-left': '200px'});
      } else {
        $this.animate({'left': '-175px'});
        $('.right-container').animate({'margin-left': '20px'});
      }
    }
  }
});
