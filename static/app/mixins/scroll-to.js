import Ember from 'ember';

export default Ember.Mixin.create({
  setupScrollToOutlet: function() {
    Ember.run.scheduleOnce('afterRender', this, function(){
      var position = this.$().offset().top;
      window.scrollTo(0, position);//$(document).height()
    });
  }.on('didInsertElement')
});
