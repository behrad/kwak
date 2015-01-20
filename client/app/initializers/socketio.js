export function initialize(container, application) {
  application.inject('route:channels', 'socket', 'socket:main');
}

export default {
  name: 'socketio',
  initialize: initialize
};
