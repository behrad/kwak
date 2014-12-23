import Ember from 'ember';

var $ = Ember.$;

export default Ember.Mixin.create({
  rerender: function () {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function () {
      $('.channels').click(function(e) {
        e.preventDefault();
        if ($(window).width() < 768) {
          var $hideChannels = $('#hide-channels');
          var $channelsList = $('#channels-list');
          $hideChannels.find('span').toggleClass('glyphicon-chevron-left');
          $hideChannels.find('span').toggleClass('glyphicon-chevron-right');
          $channelsList.toggle();
          if ($channelsList.is(':visible')) {
            $(this).css('left', 0);
            $('.right-container').css('margin-left', '200px');
          } else {
            $(this).css('left', '-175px');
            $('.right-container').css('margin-left', '20px');
          }
        }
      });
      window.scrollTo(0, document.body.scrollHeight);
      window.prettyPrint();
    });
  }
});
