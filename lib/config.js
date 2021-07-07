const fs = require('fs');
const process = require('process');
const pth = require('path');

const yaml = require('yaml');

const util = require('./util');

const CONFIG_PATH = 'config.yml';

class Config {
  constructor() {
    this.rawConfig = this.getYamlFile(CONFIG_PATH);
    util.merge(this, this.rawConfig);

    this.server.port = parseInt(process.env['port']) || this.server.port;
  }

  getYamlFile(filename) {
    let text = fs.readFileSync(util.join(filename), 'utf8');
    let obj = yaml.parse(text);
    return obj;
  }
}

module.exports = new Config();
