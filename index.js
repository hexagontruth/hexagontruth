const process = require('process');

const Builder = require('./lib/builder');
const Server = require('./lib/server');

let task = process.argv[2] || 'build';

if (require.main === module) {
  let server, builder;
  builder = new Builder();
  if (task == 'build') {
    builder.buildAll();
  }
  else if (task == 'start') {
    builder.buildAll();
    server = new Server(builder);
  }
  else {
    console.log('Plz specify a valid task lol.');
  }
}
