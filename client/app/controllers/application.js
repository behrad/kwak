import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'simple-auth-authenticator:token',
  init: function () {
    var now = new Date();

    if (! window.localStorage.hasOwnProperty('timestamp')) {
      window.localStorage['timestamp'] = now.getTime();
    }

    if (now.getTime() - window.localStorage['timestamp'] > 30000) {
      window.localStorage['timestamp'] = now.getTime();
      window.location.reload();
    }
  },
  actions: {
    reload: function () {
      window.location.reload();
    },
    tour: function () {
      var is_admin = this.get('model.is_admin');
      var tour = new Shepherd.Tour({
        defaults: {
          classes: 'shepherd-element shepherd-open shepherd-theme-arrows',
          showCancelLink: true
        }
      });
      tour.addStep('welcome', {
        text: ['This is the kwak logo. Clicking on it will always take you home'],
        attachTo: '.navbar-brand right',
      });
      tour.addStep('tags', {
        text: ['This "tags" icon is the place to be to subscribe to channels that are interesting to you.', 'You can also use it to create new channels.'],
        attachTo: '.glyphicon-tags right',
      });
      tour.addStep('channels-list', {
        text: ['This is the channels list.', 'The channels you are subscribed to are displayed here.'],
        attachTo: '.channels right',
      });
      tour.addStep('message-list', {
        text: ['Here is the message list. It displays the messages from all your channels.', 'Once you have messages here, you\'ll see how easy it is to narrow the view to a specific channel or to a topic.', 'Messages are written using the Markdown syntax.'],
        attachTo: '.message-list top',
      });
      tour.addStep('markdown', {
        text: ['If you ever need help with the Markdown syntax used to format messages, this button is here to help'],
        attachTo: '.btn-help top',
      });
      tour.addStep('connected', {
        text: ['This side panel shows the list of your team\'s users.', 'Connected users will be shown in blue at the top of the list.'],
        attachTo: '.connected left',
      });
      tour.addStep('profile', {
        text: ['Your user settings.'],
        attachTo: '.profile-settings bottom',
      });
      if (is_admin) {
        tour.addStep('admin', {
          text: ['The admin panel. Use it to add users to your team or to define default channels for your team.'],
          attachTo: '.admin-panel bottom',
        });
      }
      tour.addStep('feedback', {
        text: ['Use this feedback form in case you ever encounter a bug, or if you have a question or want to say something nice. :)'],
        attachTo: '.btn-feedback top',
      });
      tour.addStep('end', {
        text: ['This is the end of our tour. Time to start using kwak!'],
        attachTo: '.message-list top',
      });

      var lastStep = tour.steps[tour.steps.length-1];
      var self = this;
      lastStep.on('hide', function () {
        self.get('model').set('hide_tour', true).save();
      });

      tour.start();
    }
  },
});
