#!/usr/bin/env node
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _requestJson = require('request-json');

var _requestJson2 = _interopRequireDefault(_requestJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// API
var apiHost = 'https://api.github.com';

function checkArg(arg) {
  if (!arg.match(/^\S+\/\S+$/)) {
    console.error('"' + arg + '" isn\'t a valid Github repo format. Specify the Github repo as "owner/repo"');
    process.exit(1);
  }
}

function checkStatusCode(res) {
  var exit = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

  if (res.statusCode !== 200) {
    if (exit) {
      console.error('Something went wrong!');
      console.log(res.body.message);
      process.exit(1);
    }

    return false;
  }
  return true;
}

// MAIN
_commander2.default.arguments('<source:owner/repo> <target:owner/repo>').option('-u, --username <username>', 'The user to authenticate as').option('-p, --password <password>', 'The user\'s password').option('-t, --token <token>', 'The user\'s authentication OAuth token').action(function (sourceRepo, targetRepo) {

  // Check the args are valid format
  checkArg(sourceRepo);
  checkArg(targetRepo);

  // Check for a supplied Github Username
  if (!_commander2.default.username) {
    console.error('You must specify your username. (See --help)');
    process.exit(1);
  }

  // Check for either a password or OAuth token
  if (!_commander2.default.password && !_commander2.default.token) {
    console.error('You must specify a password or OAuth token. (See --help)');
    process.exit(1);
  }

  // Setup API Requests
  var client = _requestJson2.default.createClient(apiHost);

  // Setup authorization
  // If token supplied, user it over password.
  var accessKey = _commander2.default.token ? _commander2.default.token : _commander2.default.password;
  client.setBasicAuth(_commander2.default.username, accessKey);

  // Labels from Source Repo
  var labels = [];

  // Get the source repos labels.
  client.get('repos/' + sourceRepo + '/labels', function (err, res, body) {
    if (checkStatusCode(res)) {
      if (Array.isArray(body)) {
        body.forEach(function (label) {
          labels.push(label);
        });
      } else if ((typeof body === 'undefined' ? 'undefined' : _typeof(body)) === 'object') {
        labels.push(body);
      } else {
        console.error('ERROR: Expected labels to be an array or object.');
        process.exit(1);
      }

      console.log('Retrieved labels from: ' + sourceRepo);

      // Now we can create the new labels.
      console.log('Creating new labels:');
      labels.forEach(function (label) {
        client.post('/repos/' + targetRepo + '/labels', label, function (err, res, body) {
          if (checkStatusCode(res, false)) {
            console.log('CREATED: "' + label.name + '", #' + label.color);
          } else {
            if (body.errors) {
              body.errors.forEach(function (error) {
                if (error.code === 'already_exists') {
                  console.log('DUPLICATE: "' + label.name + '" was not created.');
                }
              });
            } else {
              console.log('FAILED: "' + label.name + '" was not created.');
            }
          }
        });
      });
    }
  });
}).parse(process.argv);