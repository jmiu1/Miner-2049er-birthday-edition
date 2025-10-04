import { CONFIG } from './config.js';
import { isSolidAt, isLadderAt } from './tiles.js';

export class Player {
  constructor(x, y) {
    this.spawnX = x; this.spawnY = y;
    this.width = 12; this.height = 14;
    this.reset();
  }
  reset(level) {
    this.x = this.spawnX; this.y = this.spawnY;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.climbing = false;
    this.lives = CONFIG.LIVES;
    this.dead = false;
    this.invuln = 0;
    this.powerTimer = 0;
  }
  rect() { return {x:this.x - this.width/2, y:this.y - this.height, w:this.width, h:this.height}; }
  overlaps(other) {
    if (this.invuln > 0) return false;
    const a = this.rect();
    const b = other.rect();
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  loseLife(level) {
    if (this.invuln > 0) return;
    this.lives--;
    this.invuln = 1.2;
    this.x = this.spawnX; this.y = this.spawnY; this.vx = 0; this.vy = 0;
    this.powerTimer = 0;
    if (this.lives <= 0) this.dead = true;
  }
  update(dt, input, level) {
    if (this.dead) return;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.powerTimer > 0) this.powerTimer = Math.max(0, this.powerTimer - dt);

    const left = input.down('Left') || input.down('a');
    const right = input.down('Right') || input.down('d');
    const up = input.down('Up') || input.down('w');
    const down = input.down('Down') || input.down('s');
    const jump = input.down('Space') || input.down('z');

    // Horizontal movement
    this.vx = 0;
    if (left) this.vx -= CONFIG.MOVE_SPEED;
    if (right) this.vx += CONFIG.MOVE_SPEED;

    // Ladder detection: check center tile
    const onLadder = isLadderAt(this.x, this.y - this.height/2);
    this.climbing = onLadder && (up || down);

    if (this.climbing) {
      this.vy = 0;
      if (up) this.y -= CONFIG.CLIMB_SPEED * dt;
      if (down) this.y += CONFIG.CLIMB_SPEED * dt;
    } else {
      // Gravity + jump
      this.vy += CONFIG.GRAVITY * dt;
      if (jump && this.onGround) {
        this.vy = CONFIG.JUMP_VELOCITY;
        this.onGround = false;
      }
    }

    // Integrate and collide (swept axis-aligned)
    this._moveX(dt);
    this._moveY(dt);
  }
  grantPower(duration) {
    this.powerTimer = Math.max(this.powerTimer, duration);
  }
  isPowered() {
    return this.powerTimer > 0;
  }
  _moveX(dt) {
    const nx = this.x + this.vx * dt;
    // sample feet, mid, head to prevent snagging
    if (!this._hitsSolid(nx, this.y - 1) && !this._hitsSolid(nx, this.y - this.height/2) && !this._hitsSolid(nx, this.y - this.height + 1)) {
      this.x = nx;
    }
  }
  _moveY(dt) {
    const ny = this.y + this.vy * dt;
    if (!this._hitsSolid(this.x, ny)) {
      this.y = ny;
      this.onGround = false;
    } else {
      // resolve to tile boundary
      if (this.vy > 0) {
        // moving down; snap to top of tile
        this.y = Math.floor((ny) / 16) * 16;
        this.onGround = true;
        this.vy = 0;
      } else if (this.vy < 0) {
        // moving up; snap below ceiling
        this.y = Math.floor((ny - this.height) / 16 + 1) * 16 + this.height;
        this.vy = 0;
      }
    }
  }
  _hitsSolid(px, py) {
    // test four corners of player rect
    const r = this.rect();
    const points = [
      {x: px - this.width/2, y: py},                       // left foot
      {x: px + this.width/2, y: py},                       // right foot
      {x: px - this.width/2, y: py - this.height},         // left head
      {x: px + this.width/2, y: py - this.height},         // right head
    ];
    for (const p of points) {
      if (isSolidAt(p.x, p.y)) return true;
    }
    return false;
  }
}
