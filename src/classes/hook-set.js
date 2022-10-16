import Hook from './hook.js';

export default class HookSet {
  constructor(hookList) {
    this.parent = parent;
    this.hookList = hookList;
    this.hookMap = {};
    for (let hookName of hookList) {
      this.hookMap[hookName] = new Hook();
    }
  }

  add(key, fn) {
    return this.hookMap[key]?.add(fn);
  }

  remove(key) {
    return this.hookMap[key]?.remove(key);
  }

  call(key, ...args) {
    return this.hookMap[key]?.call(...args);
  }
}
