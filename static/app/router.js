import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Ember.Router.reopen({
  didTransition: function(paths){
    this._super(paths);
    Ember.run.next(function () {
      var path = window.location.href;
      mixpanel.track("pageview", {"url": path });
    });
    Ember.run.scheduleOnce('afterRender', this, scroll);
    Ember.run.scheduleOnce('afterRender', this, messageAfterRender);
  }
});


Router.map(function () {
  this.route('landing');

  this.route('login');
  this.route('sign-up');
  this.route('sign-up', {path: '/sign-up/:uid'});


  this.route('channels', function () {
    this.route('feedback');

    this.route('help');

    this.route('admin');

    this.route('subscribe');

    this.route('channel', {path: '/:channel_id/:channel_name'}, function () {
      this.route('topic', {path: '/:topic_id/:topic_title'});
    });

    this.route('pm', {path: '/pm/:email'});
    this.route("feedback");
  });

  this.route("landing");
});

export default Router;
