import Ember from 'ember';

var $ = Ember.$;

export default Ember.Mixin.create({
  bindScrolling: function() {
    var onScroll;
    var _this = this;

    var scrollFunc = function() {
       return _this.scrolled();
    };

    onScroll = function() {
      Ember.run.debounce(_this, scrollFunc, 200);
    };

    $(document).bind('touchmove', onScroll);
    $(window).bind('scroll', onScroll);
  },

  unbindScrolling: function() {
    $(window).unbind('scroll');
    $(document).unbind('touchmove');
  }
});
