import Ember from 'ember';

export default Ember.ObjectController.extend({
  subscribed: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      return model.get('subscribed');
    } else {
      model.set('subscribed', value);
      model.save();
      return value;
    }
  }.property('model.subscribed'),

  onSelectedColor:function() {
    if(this.get('model.color') !== this.get('channel.color')) {
      this.get('model').save();
    }
  }.observes('model.color'),

  colors: [
    {id: '_01', code: '#A0522D', name: 'sienna'},
    {id: '_02', code: '#CD5C5C', name: 'indianred'},
    {id: '_03', code: '#FF4500', name: 'orangered'},
    {id: '_04', code: '#008B8B', name: 'darkcyan'},
    {id: '_05', code: '#B8860B', name: 'darkgoldenrod'},
    {id: '_06', code: '#32CD32', name: 'limegreen'},
    {id: '_07', code: '#FFD700', name: 'gold'},
    {id: '_08', code: '#48D1CC', name: 'mediumturquoise'},
    {id: '_09', code: '#87CEEB', name: 'skyblue'},
    {id: '_10', code: '#FF69B4', name: 'hotpink'},
    {id: '_11', code: '#CD5C5C', name: 'indianred'},
    {id: '_12', code: '#87CEFA', name: 'lightskyblue'},
    {id: '_13', code: '#6495ED', name: 'cornflowerblue'},
    {id: '_14', code: '#DC143C', name: 'crimson'},
    {id: '_15', code: '#FF8C00', name: 'darkorange'},
    {id: '_16', code: '#C71585', name: 'mediumvioletred'},
    {id: '_17', code: '#000000', name: 'black'},
  ],
});
