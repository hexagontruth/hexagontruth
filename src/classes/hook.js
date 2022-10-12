export default class Hook {
  constructor() {
    this.idx = 0;
    this.fns = [];
  }

  newIdx() {
    return this.idx++;
  }

  add(fn, prepend=false) {
    const idx = this.newIdx();
    const obj = [idx, fn];
    prepend ? this.fns.unshift(obj) : this.fns.push(obj);
    return idx;
  }

  remove(idx) {
    const oldLength = this.fns.length;
    this.fns = this.fns.filter(([idx, fn]) => idx != idx);
    return this.fns.length == oldLength - 1;
  }

  call(initialResult, ...args) {
    let result = initialResult;
    for (let fn of this.fns) {
      result = fn[1](result, ...args);
      if (result === false)
        break;
    }
    return result;
  }
}
