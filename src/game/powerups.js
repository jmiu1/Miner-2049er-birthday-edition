export class Powerup {
  constructor(x, y, kind) {
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.width = 14;
    this.height = 14;
    this.active = true;
  }
  rect() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      w: this.width,
      h: this.height,
    };
  }
  collect() {
    this.active = false;
  }
  reset() {
    this.active = true;
  }
}
