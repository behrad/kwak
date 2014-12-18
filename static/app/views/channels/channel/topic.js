import Ember from 'ember';
import SetupView from '../../../mixins/setup-view';
import BindScroll from '../../../mixins/bind-scroll';

var $ = Ember.$;

export default Ember.View.extend(SetupView, BindScroll, {
  didInsertElement: function() {
    this.bindScrolling();
  },
  willRemoveElement: function() {
    this.unbindScrolling();
  },
  scrolled: function() {
    $('.message:visible:not(.seen)').filter(function() {
      return $(this).visible();
    }).each(function() {
      $(this).addClass('seen');
      console.log($(this).attr('data-message-id'), 'is visible (greetings from views/channels/channel/topic)');
    });
  }
});
