function scroll () {
  var seens = $('div.message.seen');
  var unseens = $('div.message:not(.seen)');
  var position;
  if (unseens.length) {
    position = unseens.eq(0).position().top-150;
  } else {
    position = $('.message-list').height();
  }
  $(window).scrollTop(position);
}
