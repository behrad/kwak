import Ember from 'ember';
import SetupView from '../../mixins/setup-view';
import BindScroll from '../../mixins/bind-scroll';

var $ = Ember.$;

export default Ember.View.extend(SetupView, BindScroll, {
  rerender: function () {
    this._super();
    this.messageSeen();
  },
  didInsertElement: function () {
    this._super();
    this.bindScrolling();
  },
  willRemoveElement: function () {
    this._super();
    this.unbindScrolling();
  },
  scrolled: function () {
    this._super();
    this.messageSeen();
  },
  messageSeen: function () {
    var self = this;
    var controller = self.get('controller');
    $('.message:not(.seen)').filter(function () {
      return $(this).visible();
    }).each(function () {
      controller.send('markAsRead', $(this).attr('data-message-id'));
    });
    controller.send('recountUnread');
  }
});
