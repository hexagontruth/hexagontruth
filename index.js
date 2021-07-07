const process = require('process');

const Builder = require('./lib/builder');
const Server = require('./lib/server');

let port = parseInt(process.env['port']) || 8000;

let task = process.argv[2] || 'build';

if (require.main === module) {
  let server, builder;
  builder = new Builder();
  if (task == 'build') {

  }
  else if (task == 'start') {
    server = new Server(port, builder);
  }
  else {
    console.log('Plz specify a valid task lol.');
  }
}
