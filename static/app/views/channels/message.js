import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  click: function(evt) {
    var $target = $(evt.target);
    // <i> is used to collapse a message, <a> to transition to somewhere
    if ($.inArray($target.prop('tagName'), ['A', 'I']) === -1) {
      var topicId = $target.parents('.row').attr('data-topic-id');

      if ($('.unfocused').length !== 0) { // if there's a focus, unfocus all
        this.noFocus();
      } else { // if there's no focus, focus clicked element
        $('.message[data-topic-id!='+topicId+']').each(function() {
          $(this).addClass('unfocused');
        });
      }
    }
  },
  noFocus: function() {
    $('.unfocused').each(function() {
      $(this).removeClass('unfocused');
    });
  }
});
