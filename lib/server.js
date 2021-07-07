const process = require('process');
const spawn = require('child_process').spawn;

const express = require('express');

const config = require('./config');

class Server {
  constructor(builder) {
    this.port = config.server.port;
    this.builder = builder;
    this.app = express();
    this.app.use(express.static('./public'));

    this.app.listen(this.port, () => {
      console.log(`Listening on port ${this.port} lol...`);
    });

    this.sassChild = spawn('bin/sass.sh', ['--watch'], {stdio: ['pipe', process.stdout, process.stderr]});
    this.builder.watch();
  }
}

module.exports = Server;
