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
      $channelsList.toggle();
      if ($channelsList.is(':visible')) {
        $this.css('left', 0);
        $('.right-container').css('margin-left', '200px');
      } else {
        $this.css('left', '-175px');
        $('.right-container').css('margin-left', '20px');
      }
    }
  }
});
