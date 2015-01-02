import Ember from 'ember';

var $ = Ember.$;

export default Ember.TextArea.extend({

  keyDown: function (event) {
    if (event.which === 13 && ! event.shiftKey) {
      // Don't insert newlines when submitting with enter
      event.preventDefault();
      $('#messagebox').parent().submit();
    }
  },

  // This next bit lets you add newlines with shift+enter without submitting
  insertNewline: function (event) {
    if (! event.shiftKey) {
      // Do not trigger the "submit on enter" action if the user presses
      // SHIFT+ENTER, because that should just insert a new line
      this._super(event);
    }
  },

  becomeFocused: function () {
    $('#'+this.id).focus();
  }.on('didInsertElement'),

  suggest: function () {
    var self = this;
    var profilesArray = [];
    var $profiles = this.get('profiles.content.content');

    for (var i = 0; i < $profiles.get('length'); i++) {
      var profile = $profiles.objectAt(i);
      if (profile.get('name')) {
        profilesArray.push({
          name: profile.get('name'),
          email: profile.get('email'),
        });
      }
    }

    console.log(profilesArray);

    $('#'+self.id).suggest('@', {
      data: profilesArray,
      map: function (profile) {
        if (profile && profile.hasOwnProperty('name')) {
          return {
            value: '**'+profile.name+'**',
            text: '<strong>'+profile.name+'</strong> <small>'+profile.email+'</small>'
          };
        }
      },
      onshow: function () {
        var $dropdown = $('.dropdown-menu');
        $dropdown.css('top', -$dropdown.height());
      },
      onlookup: function () {
        var $dropdown = $('.dropdown-menu');
        $dropdown.css('top', -$dropdown.height());
      }
    });

  }.on('didInsertElement'),

});
