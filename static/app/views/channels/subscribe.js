import Ember from 'ember';

var $ = Ember.$;

export default Ember.View.extend({
  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, function() {
      var colors = this.get('controller.colors');
      $('.colorselector').each(function() {
        var i = 0;
        $(this).find('option').each(function() {
          $(this).attr('data-color', colors[i++]['code']);
        });
        $(this).colorselector();
      });
    });
  },
});
