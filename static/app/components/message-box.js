import Ember from 'ember';

export default Ember.TextArea.extend({

  keyDown: function (event) {
    if (event.which === 13 && ! event.shiftKey) {
      // Don't insert newlines when submitting with enter
      event.preventDefault();
      Ember.$('#messagebox').parent().submit();
    }
  },

  // This next bit lets you add newlines with shift+enter without submitting
  insertNewline: function (event) {
    if (! event.shiftKey) {
      // Do not trigger the "submit on enter" action if the user presses
      // SHIFT+ENTER, because that should just insert a new line
      this._super(event);
    }
  }

});
