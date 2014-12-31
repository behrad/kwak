import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  didInsertElement: function () {
    $('button').prop('disabled', true);
    $('#password2').keyup(function () {
      if($('#password').val() === $(this).val()) {
        $('button').prop('disabled', false);
        $(this).hide();
      }
    });
    $('#password').keyup(function () {
      if($('#password2').val() === $(this).val()) {
        $('button').prop('disabled', false);
        $('#password2').hide();
      } else {
        $('#password2').show();
        $('button').prop('disabled', true);
      }
    });
  }
});
