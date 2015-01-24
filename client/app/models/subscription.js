import DS from 'ember-data';

export default DS.Model.extend({
  subscription_id: DS.attr('string'),
  start: DS.attr('date'),
  end: DS.attr('date'),
  plan_id: DS.attr('string'),
  quantity: DS.attr('number'),
  cancel_at_period_end: DS.attr('boolean'),
  s: function () {
    return (this.get('quantity') > 1) ? 's' : '';
  }.property(),
});
