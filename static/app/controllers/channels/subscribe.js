import Ember from 'ember';

var $ = Ember.$;

export default Ember.ObjectController.extend({
  actions: {
    createChannel: function() {
      var self = this;
      self.store.createRecord('channel', {
        name: self.get('name'),
        color: self.get('color'),
        team: self.store.getById('team', self.get('team'))
      }).save().then(function() {
        Ember.run.scheduleOnce('afterRender', this, function() {
          var colors = self.colors;
          $('.colorselector').each(function() {
            var i = 0;
            $(this).find('option').each(function() {
              $(this).attr('data-color', colors[i++]['code']);
            });
            $(this).colorselector();
          });
        });
      });
    },
  },

  teams: function() {
    return this.store.all('team');
  }.property(),

  subscribed: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      return model.get('subscribed');
    } else {
      if (model.get('subscribed') !== value) {
        model.set('subscribed', value);
        model.save();
      }
      return value;
    }
  }.property('model.subscribed'),

  onSelectedColor: function() {
    if (this.get('model.content.length')) {
      return;
    }
    this.get('model').save();
  }.observes('model.color'),

  colors: [
    {id: '_01', code: '#f44336', name: 'red'},
    {id: '_02', code: '#e91e63', name: 'pink'},
    {id: '_03', code: '#9c27b0', name: 'purple'},
    {id: '_04', code: '#673ab7', name: 'deep purple'},
    {id: '_05', code: '#3f51b5', name: 'indigo'},
    {id: '_06', code: '#2196f3', name: 'blue'},
    {id: '_07', code: '#03a9f4', name: 'light blue'},
    {id: '_08', code: '#00bcd4', name: 'cyan'},
    {id: '_09', code: '#009688', name: 'teal'},
    {id: '_10', code: '#4caf50', name: 'green'},
    {id: '_11', code: '#8bc34a', name: 'light green'},
    {id: '_12', code: '#cddc39', name: 'lime'},
    {id: '_13', code: '#ffeb3b', name: 'yellow'},
    {id: '_14', code: '#ffc107', name: 'amber'},
    {id: '_15', code: '#ff9800', name: 'orange'},
    {id: '_16', code: '#ff5722', name: 'deep orange'},
    {id: '_17', code: '#795548', name: 'brown'},
    {id: '_18', code: '#9e9e9e', name: 'grey'},
    {id: '_19', code: '#607d8b', name: 'blue grey'},
    {id: '_20', code: '#000000', name: 'black'},
  ],
});
