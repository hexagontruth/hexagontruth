const process = require('process');
const spawn = require('child_process').spawn;

const express = require('express');

class Server {
  constructor(port, builder) {
    this.port = port;
    this.builder = builder;
    this.app = express();
    this.app.use(express.static('.'));

    this.app.listen(port, () => {
      console.log(`Listening on port ${port} lol...`);
    });

    this.sassChild = spawn('bin/sass.sh', ['--watch'], {stdio: ['pipe', process.stdout, process.stderr]});

  }
}

module.exports = Server;
