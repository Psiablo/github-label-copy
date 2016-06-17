#!/usr/bin/env node
import program from 'commander';
import request from 'request-json';

// API
const apiHost = 'https://api.github.com';

function checkArg(arg) {
  if (!arg.match(/^\S+\/\S+$/)) {
    console.error(`"${arg}" isn't a valid Github repo format. Specify the Github repo as "owner/repo"`)
    process.exit(1);
  }
}

function checkStatusCode(res, exit = true) {
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
program
  .arguments('<source:owner/repo> <target:owner/repo>')
  .option('-u, --username <username>', 'The user to authenticate as')
  .option('-p, --password <password>', 'The user\'s password')
  .option('-t, --token <token>', 'The user\'s authentication OAuth token')
  .option('-d, --delete', 'Delete the target repos labels. Replaced by source repos labels')
  .action( (sourceRepo, targetRepo) => {

    // Check the args are valid format
    checkArg(sourceRepo);
    checkArg(targetRepo);

    // Check for a supplied Github Username
    if (!program.username) {
      console.error('You must specify your username. (See --help)');
      process.exit(1);
    }

    // Check for either a password or OAuth token
    if (!program.password && !program.token) {
      console.error('You must specify a password or OAuth token. (See --help)');
      process.exit(1);
    }

    // Setup API Requests
    const client = request.createClient(apiHost);

    // Setup authorization
    // If token supplied, user it over password.
    const accessKey = program.token ? program.token : program.password;
    client.setBasicAuth(program.username, accessKey);

    // Labels from Source Repo
    const labels = [];

    // Get the source repos labels.
    client.get(`repos/${sourceRepo}/labels`, (err, res, body) => {
      if (checkStatusCode(res)) {
        if (Array.isArray(body)) {
          body.forEach((label) => {
            labels.push(label);
          });
        } else if (typeof body === 'object') {
          labels.push(body);
        } else {
          console.error('ERROR: Expected labels to be an array or object.');
          process.exit(1);
        }

        console.log(`Retrieved labels from: ${sourceRepo}`);

        // Now we can create the new labels.
        console.log('Creating new labels:');
        labels.forEach((label) => {
          client.post(`/repos/${targetRepo}/labels`, label, (err, res, body) => {
            if (checkStatusCode(res, false)) {
              console.log(`CREATED: "${label.name}", #${label.color}`);
            } else {
              if (body.errors) {
                body.errors.forEach((error) => {
                  if (error.code === 'already_exists') {
                    console.log(`DUPLICATE: "${label.name}" was not created.`);
                  }
                })
              } else {
                console.log(`FAILED: "${label.name}" was not created.`);
              }
            }
          });
        });
      }
    });
  })
  .parse(process.argv);
