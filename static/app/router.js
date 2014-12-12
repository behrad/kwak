import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('channels', function() {
    this.route('channel', {path: '/:channel_id/:name'});
  });
});

export default Router;
