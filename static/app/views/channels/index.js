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
    Ember.run.later(function () {
      var seens = $('div.message.seen');
      var unseens = $('div.message:not(.seen)');
      var position;
      if (unseens.length) {
        position = unseens.eq(0).position().top;
      } else if (seens.length) {
        position = seens.eq(-1).position().bottom;
      }
      if (position) {
        console.log('scroll to ', position);
        window.scroll(0, position);
      }
    }, 1000);
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
    if (controller) {
      controller.send('recountUnread');
    }
  }
});
