import Ember from 'ember';
import SetupView from '../../../mixins/setup-view';
import BindScroll from '../../../mixins/bind-scroll';

var $ = Ember.$;

export default Ember.View.extend(SetupView, BindScroll, {
  rerender: function() {
    this.messageSeen();
  },
  didInsertElement: function() {
    this.bindScrolling();
  },
  willRemoveElement: function() {
    this.unbindScrolling();
  },
  scrolled: function() {
    this.messageSeen();
  },
  messageSeen: function() {
    var self = this;
    $('.message:visible:not(.seen)').filter(function() {
      return $(this).visible();
    }).each(function() {
      self.get('controller').send('markAsRead', $(this).attr('data-message-id'));
      $(this).addClass('seen');
    });
  }
});
