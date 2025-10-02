export class Input {
  constructor() {
    this.keys = new Set();
    window.addEventListener('keydown', e => this.keys.add(normalize(e.key)));
    window.addEventListener('keyup', e => this.keys.delete(normalize(e.key)));
  }
  down(k) { return this.keys.has(k); }
}
function normalize(k) {
  const m = { 'ArrowLeft':'Left', 'ArrowRight':'Right', 'ArrowUp':'Up', 'ArrowDown':'Down', ' ':'Space' };
  return m[k] || (k.length === 1 ? k.toLowerCase() : k);
}
