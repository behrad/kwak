/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

app.import('bower_components/momentjs/moment.js');
app.import('bower_components/spin.js/spin.js');
app.import('bower_components/bootstrap/dist/js/bootstrap.min.js');
app.import('vendor/colorselector/bootstrap-colorselector.js');
app.import('vendor/markdown/showdown.js');
app.import('vendor/markdown/extensions/github.js');
app.import('vendor/markdown/prettify/prettify.js');
app.import('vendor/jquery.visible.js');

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
