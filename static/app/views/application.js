import Ember from 'ember';

export default Ember.View.extend({
  didInsertElement: function() {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function(){
      $('#messagebox').keypress(function(e){
        if(e.which === 13){
          $('#messageform').submit();
        }
      });
      $("html, body").animate({ scrollTop: $(document).height() }, 1000);
    });
  }
});
