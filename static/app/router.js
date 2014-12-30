import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function () {

  this.route('login');
  this.route('sign-up');

  this.route('channels', function () {
    this.route('channel', {path: '/:channel_id/:channel_name'}, function () {
      this.route('topic', {path: '/:topic_id/:topic_title'});
    });
    this.route('subscribe');
  });

});

export default Router;
