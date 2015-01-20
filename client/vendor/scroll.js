function scroll () {
  var seens = $('div.message.seen');
  var unseens = $('div.message:not(.seen)');
  var position;
  if (unseens.length) {
    console.log('scroll to not seen');
    position = unseens.eq(0).position().top-150;
  } else {
    console.log('scroll to bottom');
    position = $('.message-list').height();
  }
  $(window).scrollTop(position);
}
