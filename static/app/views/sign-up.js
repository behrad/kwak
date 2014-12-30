import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  didInsertElement: function () {
    $('#password2').keyup(function () {
      if($('#password').val() === $(this).val()) {
        $(this).hide();
      }
    });
    $('#password').keyup(function () {
      if($('#password2').val() === $(this).val()) {
        $('#password2').hide();
      } else {
        $('#password2').show();
      }
    });
  }
});
