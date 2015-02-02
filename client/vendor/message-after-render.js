function messageAfterRender () {

  $(".navbar-fixed-top").autoHidingNavbar({
    showOnBottom: false,
  });

  window.prettyPrint();

  var groupId = 0;
  var inGroup = false;

  var groups = [];

  $('.message-list > .message').each(function () {
    var $this = $(this);
    var $next = $this.next();
    if ($this.attr('data-topic-id') === $next.attr('data-topic-id')) {
      if (!inGroup) {
        groupId++;
        inGroup = true;
        groups[groupId] = [];
      }
      $this.children('div').css('border-bottom', 0);
      $this.css('margin', '0');
      $this.css('margin-bottom', '2px');
      $next.find('.message-header').hide();
      $next.find('h5').eq(0).css('margin-top', 0);
      if ($.inArray($this, groups[groupId]) === -1) {
        $this.detach();
        groups[groupId].push($this);
      }
      $next.detach();
      groups[groupId].push($next);
    } else {
      if (!inGroup) {
        $this.detach();
        groupId++;
        groups[groupId] = [];
        groups[groupId].push($this);
      } else {
        inGroup = false;
        $this.detach();
        groups[groupId].push($this);
      }
    }
  });

  groups.forEach(function (group) {
    var $group = $('<div class="group"></div>');
    group.forEach(function (message) {
      message.appendTo($group);
    });
    $group.appendTo('.message-list');
  });

}
