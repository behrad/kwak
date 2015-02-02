function messageAfterRender () {

  $(".navbar-fixed-top").autoHidingNavbar({
    showOnBottom: false,
  });

  window.prettyPrint();

  $('.message').each(function () {
    var $this = $(this);
    var $next = $this.next();
    if ($this.attr('data-topic-id') === $next.attr('data-topic-id')) {
      $next.find('.message-header').hide();
      $next.find('h5').eq(0).css('margin-top', 0);
      $this.children('div').css('border-bottom', 0);
      $this.css('margin', '0');
      $this.css('margin-bottom', '2px');
    }
  });
}
