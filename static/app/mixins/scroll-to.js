import Ember from 'ember';

export default Ember.Mixin.create({
  setupScrollToOutlet: function() {
    Ember.run.scheduleOnce('afterRender', this, function(){
      window.scrollTo(0, document.body.scrollHeight);
    });
  }.on('didInsertElement')
});
