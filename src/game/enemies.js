export class Enemy {
  constructor(x, y, minX, maxX) {
    this.spawn = {x,y};
    this.x = x; this.y = y;
    this.width = 12; this.height = 14;
    this.vx = 40; // patrol speed
    this.minX = Math.min(minX, maxX);
    this.maxX = Math.max(minX, maxX);
    this.state = 'patrol';
    this.respawnTimer = 0;
  }
  reset() {
    this.x = this.spawn.x; this.y = this.spawn.y; this.vx = 40;
    this.state = 'patrol';
    this.respawnTimer = 0;
  }
  rect() {
    if (this.state !== 'patrol') {
      return {x:0, y:0, w:0, h:0};
    }
    return {x:this.x - this.width/2, y:this.y - this.height, w:this.width, h:this.height};
  }
  update(dt, level) {
    if (this.state === 'respawn') {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.state = 'patrol';
        this.x = this.spawn.x;
        this.y = this.spawn.y;
        this.vx = 40;
      }
      return;
    }
    this.x += this.vx * dt;
    if (this.x < this.minX) { this.x = this.minX; this.vx *= -1; }
    if (this.x > this.maxX) { this.x = this.maxX; this.vx *= -1; }
  }
  defeat() {
    this.state = 'respawn';
    this.respawnTimer = 3.5;
  }
  isActive() {
    return this.state === 'patrol';
  }
}
