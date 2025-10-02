export class Enemy {
  constructor(x, y, minX, maxX) {
    this.spawn = {x,y};
    this.x = x; this.y = y;
    this.width = 12; this.height = 14;
    this.vx = 40; // patrol speed
    this.minX = Math.min(minX, maxX);
    this.maxX = Math.max(minX, maxX);
  }
  reset() {
    this.x = this.spawn.x; this.y = this.spawn.y; this.vx = 40;
  }
  rect() { return {x:this.x - this.width/2, y:this.y - this.height, w:this.width, h:this.height}; }
  update(dt, level) {
    this.x += this.vx * dt;
    if (this.x < this.minX) { this.x = this.minX; this.vx *= -1; }
    if (this.x > this.maxX) { this.x = this.maxX; this.vx *= -1; }
  }
}
