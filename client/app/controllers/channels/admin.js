import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['profile', 'channels/channel/mark-as-read', 'profiles'],
  currentUser: Ember.computed.alias('controllers.profile'),

  init: function () {
    this._super();
    var controller = this.get('controllers.channels/channel/mark-as-read');
    if (controller) {
      controller.send('recountUnread');
    }
  },

  plans: [
    { name: 'annually', price: 3 },
    { name: 'monthly', price: 4 }
  ],

  usersNumber: 10,

  detail: function () {
    var factor = '1 month';
    if (this.get('plan') === 3) {
      factor = '12 months';
    }
    return factor+' × $'+(this.get('plan'))+' × '+this.get('usersNumber')+' users =';
  }.property('plan', 'usersNumber'),

  amount: function () {
    var factor = 1;
    if (this.get('plan') === 3) {
      factor = 12;
    }
    return factor*this.get('plan')*this.get('usersNumber');
  }.property('plan', 'usersNumber'),

  amountCents: function () {
    return this.get('amount')*100;
  }.property('amount'),


  team: function () {
    return this.store.all('team').objectAt(0);
  }.property(),

  teams: function () {
    return this.get('currentUser.content.teams.content');
  }.property(),

  hasMultipleTeams: function() {
    return this.get('currentUser.content.teams.content.length') > 1;
  }.property().volatile(),

  profiles: function () {
    return this.get('controllers.profiles');
  }.property().volatile(),

  actives: function () {
    var self = this;
    return this.get('profiles').filter(function (profile) {
      return profile.get('name') && profile.get('is_active') && profile.get('id') !== self.get('currentUser.model.id');
    }).sortBy('name');
  }.property('profiles.@each.is_active'),

  inactives: function () {
    return this.get('profiles').filterBy('is_active', false).sortBy('name');
  }.property('profiles.@each.is_active'),

  actions: {
    toggleActive: function (id, is_active) {
      var self = this;
      self.store.find('profile', id).then(function (profile) {
        profile.set('is_active', !is_active);
        profile.save().then(function (/*savedProfile*/) {}, function (error) {
          profile.set('is_active', is_active);
          self.set('userError', error.responseJSON.error);
        });
      });
    },
    toggleDefault: function (id, is_default) {
      this.store.find('channel', id).then(function (channel) {
        channel.set('is_default', !is_default);
        channel.save();
      });
    },
    toggleCanChangeNames: function (id, users_can_change_names) {
      this.store.find('team', id).then(function (team) {
        team.set('users_can_change_names', !users_can_change_names);
        team.save();
      });
    },
    processStripeToken: function (token) {
      var payload = {
        'token': token,
        'price': this.get('plan'),
        'usersNumber': this.get('usersNumber'),
        'amount': this.get('amount'),
      };
      var factor = 1;
      if (payload.price === 3) {
        factor = 12;
      }
      if (payload.amount !== factor*payload.price*payload.usersNumber) {
        this.set('error', 'We encountered an error. You have not been charged');
        return;
      }

      Ember.$.post('api/checkout/', JSON.stringify(payload), function () {
        mixpanel.track('checkout pay');
        mixpanel.people.track_charge(payload.amount);
        //TODO : toggle has_paid, hide checkout form, display summary
      }).fail(function (a) {
        alert('lala', a);
        console.log(a);
      });
    }
  }
});
