const child_process = require('child_process');
const process = require('process');

const chokidar = require('chokidar');
const glob = require('glob');

const config = require('./config');
const util = require('./util');

const exec = util.promisify(child_process.exec);
const getFiles = util.promisify(glob);

// --- Main ---

if (require.main === module) {
  let env = process.env.env || 'prod';
  buildAll(env);
}

class Builder {
  constructor() {
    this.sourceDir = config.builder.sourceDir;
    this.targetDir = config.builder.targetDir;
    this.files = config.builder.files;
    this.watchers = [];
  }

  async buildAll() {
    let targets = {};
    let tasks = [];
    await exec(`mkdir -p "${util.join(this.targetDir)}"`);
    this._eachFile((filename, props) => {
      tasks.push(this.build(filename, props));
    });
    await Promise.all(tasks);
  }

  async build(filename, props) {
    if (filename.match(/^.+\.js$/))
      await this.buildJs(filename, props);
  }

  async buildJs(filename, paths) {
    console.log('hello', paths);
    let content = Array(paths.length);
    let tasks = [];
    tasks = paths.map(async (path, idx) => {
      let filenames = await getFiles(util.join(this.sourceDir, path));
      let pathContent = Array(filenames.length);
      let pathTasks = filenames.map(async (filename, idx) => {
        console.log(this.sourceDir);
        let fileContent = await util.readFile(filename, 'utf8');
        pathContent[idx] = fileContent;
      });
      await Promise.all(pathTasks);
      content[idx] = pathContent.join('\n');
    });
    await Promise.all(tasks);
    content = content.join('\n');
    await util.writeFile(util.join(this.targetDir, filename), content);
    console.log(`Wrote ${filename} at ${new Date().toISOString()}`);
  }

  async buildPage(filename, config) {
    
  }

   watch() {
    this.watcher = chokidar.watch(util.join('client'));
    this.watcher.on('change', () => {
      setTimeout(() => {
        this.buildAll();
      }, 100);
    });
    // this._eachFile((filename, paths) => {
    //   for (let path of paths) {
    //     let watcher = chokidar.watch(path);
    //     watcher.on('change', () => {
    //       setTimeout(() => {
    //         this.build(filename, paths);
    //       }, 100);
    //     });
    //     this.watchers.push(watcher);
    //   }
    // });
  }

  _eachFile(fn) {
    Object.entries(this.files).forEach((args) => fn(...args));
  }
}

module.exports = Builder;
