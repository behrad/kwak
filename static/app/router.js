import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {

  this.route('login');

  this.route('channels', function() {
    this.route('channel', {path: '/:channel_id/:channel_name'});
    this.route('topic', {path: '/:channel_id/:channel_name/:topic_id/:topic_name'});
  });

});

export default Router;
