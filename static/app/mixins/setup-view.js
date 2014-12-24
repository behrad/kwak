import Ember from 'ember';

export default Ember.Mixin.create({
  rerender: function () {
    this._super();
    Ember.run.scheduleOnce('afterRender', this, function () {
      window.prettyPrint();
    });
  },
});
