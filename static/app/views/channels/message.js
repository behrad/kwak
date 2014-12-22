import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function(evt) {
    var $target = $(evt.target);
    // <i> is used to collapse a message, <a> to transition to somewhere
    if ($.inArray($target.prop('tagName'), ['A', 'I']) === -1) {
      var topicId = $target.parents('.row').attr('data-topic-id');
      var $topic = $('.message[data-topic-id='+topicId+']');
      if ($('.unfocused').length !== 0) { // if there's a focus, unfocus all
        this.noFocus();
      } else { // if there's no focus, focus clicked element
        var $message = $('.message[data-topic-id!='+topicId+']');
        $message.each(function() {
          $(this).addClass('unfocused');
          $('#topic').val();
        });

        $('#topic').val($topic.find('a.topic-title').html().trim());
        $('#channel-select').val($topic.attr('data-topic-id'));
      }
    }
  },
  noFocus: function() {
    $('.unfocused').each(function() {
      $(this).removeClass('unfocused');
    });
  }
});
