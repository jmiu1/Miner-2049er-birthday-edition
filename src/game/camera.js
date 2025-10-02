export class Camera {
  constructor(x, y, vw, vh, worldW, worldH) {
    this.x = x; this.y = y; this.vw = vw; this.vh = vh;
    this.worldW = worldW; this.worldH = worldH;
  }
  follow(px, py) {
    // center camera
    this.x = px - this.vw/2;
    this.y = py - this.vh/2;
    // clamp
    this.x = Math.max(0, Math.min(this.x, this.worldW - this.vw));
    this.y = Math.max(0, Math.min(this.y, this.worldH - this.vh));
  }
}
