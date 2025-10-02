import { getPaintStats, paintUnderfoot, resetPaint } from './tiles.js';

let time = 0;
let win = false;
let gameover = false;

export function updateRules(dt, level, player) {
  if (player.dead) gameover = true;
  if (win || gameover) return;
  time += dt;
  // Paint tile under player's feet
  paintUnderfoot(player.x, player.y);
  const stats = getPaintStats(level);
  if (stats.total > 0 && stats.painted === stats.total) {
    win = true;
  }
}

export function resetRules() {
  time = 0; win = false; gameover = false;
  resetPaint();
}

export function getRules() {
  return { time, win, gameover };
}
