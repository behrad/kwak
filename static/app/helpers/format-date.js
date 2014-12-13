import Ember from 'ember';

export function formatDate(input) {
  var m = moment(input);
  if (m.isSame(new Date(), "day")) {
    return m.format('HH:mm');
  } else {
    return m.format('dddd, Do HH:mm');
  }
}

export default Ember.Handlebars.makeBoundHelper(formatDate);
