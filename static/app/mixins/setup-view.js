import Ember from 'ember';

var $ = Ember.$;

export default Ember.Mixin.create({
  rerender: function () {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function () {
      window.prettyPrint();

      $('.message').each(function() {
        var $this = $(this);
        var $next = $this.next();
        if ($this.attr('data-topic-id') === $next.attr('data-topic-id')) {
          $next.find('.message-header').hide();
          $this.children('div').css('border-bottom', 0);
          $this.css('margin', '0px');
          $this.css('margin-bottom', '2px');
        }
      });
    });
  },
});
