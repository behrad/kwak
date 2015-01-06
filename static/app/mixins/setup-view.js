import Ember from 'ember';

var $ = Ember.$;

export default Ember.Mixin.create({
  didInsertElement: function () {
    $(".navbar-fixed-top").autoHidingNavbar({
      showOnBottom: false,
    });
  },
  rerender: function () {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function () {
      window.prettyPrint();

      $('.message').each(function() {
        var $this = $(this);
        var $next = $this.next();
        if ($this.attr('data-topic-id') === $next.attr('data-topic-id')) {
          $next.find('.message-header').hide();
          $next.find('h5').eq(0).css('margin-top', 0);
          $this.children('div').css('border-bottom', 0);
          $this.css('margin', '0px');
          $this.css('margin-bottom', '2px');
        }
      });
    });
  },
});
