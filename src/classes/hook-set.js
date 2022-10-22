import Hook from './hook.js';

export default class HookSet {
  constructor(hookList, ...args) {
    this.parent = parent;
    this.hookList = hookList;
    this.hookMap = {};
    this.defaultArgs = args;
    for (let hookName of hookList) {
      this.hookMap[hookName] = new Hook();
    }
  }

  add(key, fn) {
    return this.hookMap[key]?.add(fn);
  }

  addAll(arg) {
    if (Array.isArray(arg)) {
      arg.forEach(([key, fn]) => this.add(key, fn));
    }
    else {
      Object.entries(arg).forEach(([key, fnArg]) => {
        if (typeof fnArg == 'function') {
          this.add(key, fnArg);
        }
        else {
          this.addAll(fnArg.map((fn) => [key, fn]));
        }
      });
    }
  }

  remove(key) {
    return this.hookMap[key]?.remove(key);
  }

  call(key, ...args) {
    return this.hookMap[key]?.call(...this.defaultArgs, ...args);
  }
}
