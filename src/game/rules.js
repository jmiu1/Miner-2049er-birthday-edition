import { getPaintStats, paintUnderfoot, resetPaint } from './tiles.js';
import { playSound } from './audio.js';

let time = 0;
let win = false;
let gameover = false;
let score = 0;

export function updateRules(dt, level, player) {
  if (player.dead) gameover = true;
  if (win || gameover) return;
  time += dt;
  // Paint tile under player's feet
  if (paintUnderfoot(player.x, player.y)) {
    addScore(50);
    playSound('paint');
  }
  const stats = getPaintStats(level);
  if (stats.total > 0 && stats.painted === stats.total) {
    win = true;
  }
}

export function resetRules() {
  time = 0; win = false; gameover = false; score = 0;
  resetPaint();
}

export function getRules() {
  return { time, win, gameover, score };
}

export function addScore(amount) {
  score += amount;
}
