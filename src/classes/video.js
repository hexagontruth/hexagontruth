export default class Video {
  static create(el) {
    Video.instance && Video.instance.delete();
    Video.instance = el && new Video(el);
    return Video.instance;
  }

  constructor(el) {
    this.el = el;
    let slug = el.getAttribute('data-slug');
    this.sizes = el.getAttribute('data-sizes').split(',').map((e) => parseInt(e));
    this.breakpoints = el.getAttribute('data-breakpoints').split(',').map((e) => parseInt(e));
    this.filenames = this.sizes.map((e) => slug.replace('%', e));
    this.selected = Infinity;
    this.q = {};
    window.addEventListener('resize', (ev) => this.onResize(ev));
    window.addEventListener('scroll', (ev) => this.onScroll(ev));
    this.onResize();
    this.onScroll();
  }

  queueEventHandler(eventName, fn) {
    if (this.q[eventName]) {
      clearTimeout(this.q[eventName]);
    }
    this.q[eventName] = setTimeout(fn, 100);
  }

  selectSource() {
    let last = this.selected;
    this.selected = Math.min(this.selected, this.breakpoints.findIndex((e) => e < this.maxDim));
    if (last != this.selected)
      this.el.src = this.filenames[this.selected];
  }

  onScroll(ev) {
    this.scrollPos = window.scrollY / this.scrollRange;
    this.el.style.transform = `translateY(${(-this.parallaxRange * this.scrollPos).toFixed(2)}px)`;
  }

  onResize() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    this.scrollRange = document.documentElement.scrollHeight - height;
    this.scrollFactor = document.documentElement.scrollHeight / height;
    this.parallaxFactor = 1 + (this.scrollFactor - 1) / 6;
    this.parallaxRange = (this.parallaxFactor - 1) * height;
    this.w = width;
    this.h = height * this.parallaxFactor;
    this.el.style.height = `${this.h}px`;
    this.maxDim = Math.max(this.w, this.h);
    this.selectSource();
  }
}
