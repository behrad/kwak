import Ember from 'ember';
import BindScroll from '../../mixins/bind-scroll';

var $ = Ember.$;

export default Ember.View.extend(BindScroll, {
  didInsertElement: function () {
    var $userfield = $('#for');
    $userfield.keyup(function() {
      var val = $userfield.val() === '' ? '' : parseInt($userfield.val(), 10);
      var newVal = val;
      if (val < 0) {
        newVal = 10;
      }
      if (isNaN(val) && val !== '') {
        newVal = 10;
      }
      if (newVal !== val) {
        $userfield.val(newVal);
      }

      if (newVal > 50) {
        $('#inquiry').show();
        $('.amount-due').hide();
        $('.stripe-checkout').hide();
      } else {
        $('#inquiry').hide();
        $('.amount-due').show();
        $('.stripe-checkout').show();
      }
    });

    var $checkoutOpenButton = $('.btn.stripe-checkout');
    $checkoutOpenButton.click(function () {
      mixpanel.track('checkout open');
    });
  },
});
