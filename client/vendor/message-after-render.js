function messageAfterRender () {

  $(".navbar-fixed-top").autoHidingNavbar({
    showOnBottom: false,
  });

  window.prettyPrint();

  var counter = 0;
  var groups = [];

  $('.message-list > .message').each(function () {
    var $this = $(this);
    var $prev = $this.prev();
    var $next = $this.next();

    if ($this.attr('data-topic-id') !== $prev.attr('data-topic-id')) {
      console.log('new group '+ $this.attr('data-message-id'));
      counter++;
      groups[counter] = [];
      groups[counter].push($this);
    }

    if ($this.attr('data-topic-id') === $next.attr('data-topic-id')) {
      console.log('continuation ' + $this.attr('data-message-id'));
      $next.find('.message-header').hide();
      $next.find('h5').eq(0).css('margin-top', 0);
      $this.children('div').css('border-bottom', 0);
      $this.css('margin', '0');
      $this.css('margin-bottom', '2px');
      groups[counter].push($next);
    }
  });

  $('.message-list > .message').remove();

  groups.forEach(function (group) {
    var $group = $('<div class="group"></div>');
    group.forEach(function (message) {
      message.appendTo($group);
    });
    $group.appendTo('.message-list');
  });
}
