import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function() {
      $("html, body").animate({ scrollTop: $(document).height() }, 1000);
    });
  }
});
