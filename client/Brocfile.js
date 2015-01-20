/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// JS files
app.import('bower_components/momentjs/moment.js');
app.import('bower_components/spin.js/spin.js');
app.import('bower_components/bootstrap/dist/js/bootstrap.min.js');
app.import('vendor/colorselector/bootstrap-colorselector.js');
app.import('vendor/bootstrap-suggest/js/bootstrap-suggest.js');
app.import('vendor/markdown/showdown.js');
app.import('vendor/markdown/extensions/github.js');
app.import('vendor/markdown/prettify/prettify.js');
app.import('vendor/jquery.visible.js');
app.import('vendor/jquery.bootstrap-autohidingnavbar.min.js');
app.import('vendor/scroll.js');
app.import('vendor/message-after-render.js');
app.import('bower_components/socket.io-client/socket.io.js');
app.import('bower_components/ember-sockets/dist/ember-sockets.js');

// CSS files
app.import('bower_components/bootstrap/dist/css/bootstrap.min.css');
app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', {
  destDir: 'fonts'
});
app.import('bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', {
  destDir: 'fonts'
});
app.import('vendor/colorselector/bootstrap-colorselector.css');
app.import('vendor/bootstrap-suggest/css/bootstrap-suggest.css');
app.import('vendor/markdown/prettify/prettify.css');

// Other assets
app.import('vendor/assets/images/kwak.png'); // logo
// landing page
app.import('vendor/assets/images/1.png');
app.import('vendor/assets/images/2.png');
app.import('vendor/assets/images/3.png');

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

module.exports = app.toTree();
