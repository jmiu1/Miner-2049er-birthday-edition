import { CONFIG } from './config.js';
import { getLayer, getPaintMask } from './tiles.js';

export function render(ctx, cam, level, player, enemies, powerups, rules) {
  const scale = CONFIG.WORLD_SCALE;
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(scale, 0, 0, scale, -cam.x * scale, -cam.y * scale);
  ctx.fillStyle = '#05050c';
  ctx.fillRect(cam.x, cam.y, cam.vw, cam.vh);

  drawTiles(ctx, level);
  drawPaint(ctx, level);
  drawLadders(ctx, level);
  drawPowerups(ctx, powerups);
  drawEnemies(ctx, enemies, player.isPowered());
  drawPlayer(ctx, player);

  ctx.setTransform(1,0,0,1,0,0);
  drawHud(ctx, rules, player);
  if (rules.gameover) {
    overlay(ctx, 'GAME OVER', 'Press R to restart');
  } else if (rules.win) {
    overlay(ctx, 'YOU WIN!', 'Press R to play again');
  }
}

function drawTiles(ctx, level) {
  const solid = getLayer('solid').data;
  const W = level.width, H = level.height, T = level.tileSize;
  ctx.fillStyle = '#072a16';
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {
      if (solid[y*W + x] === 1) {
        ctx.fillRect(x*T, y*T, T, T);
      }
    }
  }
}

function drawPaint(ctx, level) {
  const paint = getLayer('paint').data;
  const painted = getPaintMask();
  const W = level.width, H = level.height, T = level.tileSize;
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {
      const i = y*W + x;
      if (paint[i] === 1) {
        ctx.fillStyle = painted[i] ? '#7bf379' : '#1f9d4c';
        ctx.fillRect(x*T+2, y*T+2, T-4, T-4);
      }
    }
  }
}

function drawLadders(ctx, level) {
  const ladder = getLayer('ladder').data;
  const W = level.width, H = level.height, T = level.tileSize;
  ctx.fillStyle = '#d984ff';
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {
      if (ladder[y*W + x] === 1) {
        const px = x*T;
        const py = y*T;
        ctx.fillRect(px + 5, py, 2, T);
        ctx.fillRect(px + 9, py, 2, T);
        ctx.fillRect(px + 4, py + 3, T - 8, 2);
        ctx.fillRect(px + 4, py + 9, T - 8, 2);
      }
    }
  }
}

function drawPowerups(ctx, powerups) {
  for (const power of powerups) {
    if (!power.active) continue;
    const r = power.rect();
    ctx.save();
    ctx.translate(r.x, r.y);
    if (power.kind === 'shovel') {
      ctx.fillStyle = '#5ad5ff';
      ctx.fillRect(5, 0, 2, r.h);
      ctx.fillRect(2, 6, 8, 4);
    } else {
      ctx.fillStyle = '#ffe56d';
      ctx.fillRect(6, 0, 2, r.h - 5);
      ctx.fillRect(2, r.h - 8, 10, 6);
    }
    ctx.restore();
  }
}

function drawEnemies(ctx, enemies, powered) {
  for (const e of enemies) {
    if (!e.isActive()) continue;
    const r = e.rect();
    ctx.save();
    ctx.translate(r.x, r.y);
    const bodyColor = powered ? '#6ac8ff' : '#f1883a';
    ctx.fillStyle = bodyColor;
    ctx.fillRect(2, 4, r.w - 4, r.h - 4);
    ctx.fillStyle = '#220b14';
    ctx.fillRect(4, 6, 3, 3);
    ctx.fillRect(r.w - 7, 6, 3, 3);
    ctx.restore();
  }
}

function drawPlayer(ctx, player) {
  if (player.dead) return;
  const r = player.rect();
  ctx.save();
  ctx.translate(r.x, r.y);
  const suit = player.isPowered() ? '#5ad5ff' : '#3ca754';
  ctx.fillStyle = '#8b4b1e';
  ctx.fillRect(1, 0, r.w - 2, 3);
  ctx.fillRect(2, 3, r.w - 4, 1);
  ctx.fillStyle = '#f0c799';
  ctx.fillRect(3, 4, r.w - 6, 4);
  ctx.fillStyle = suit;
  ctx.fillRect(2, 8, r.w - 4, 5);
  ctx.fillStyle = '#0b1b21';
  ctx.fillRect(2, r.h - 3, 4, 3);
  ctx.fillRect(r.w - 6, r.h - 3, 4, 3);
  ctx.restore();
}

function drawHud(ctx, rules, player) {
  ctx.fillStyle = '#030308';
  ctx.fillRect(0, 0, ctx.canvas.width, 56);
  ctx.fillStyle = '#28f75f';
  ctx.font = '700 16px "Press Start 2P", monospace';
  ctx.textBaseline = 'top';
  ctx.fillText('PLAYER 1', 24, 12);
  ctx.fillStyle = '#f8f8ff';
  ctx.font = '700 22px "Press Start 2P", monospace';
  ctx.fillText(padScore(rules.score), 24, 30);

  const timeLabel = 'TIME';
  ctx.fillStyle = '#ffd447';
  ctx.font = '700 16px "Press Start 2P", monospace';
  const centerX = ctx.canvas.width / 2 - ctx.measureText(timeLabel).width / 2;
  ctx.fillText(timeLabel, centerX, 12);
  ctx.fillStyle = '#f8f8ff';
  ctx.font = '700 22px "Press Start 2P", monospace';
  const formattedTime = formatTime(rules.time);
  ctx.fillText(formattedTime, ctx.canvas.width / 2 - ctx.measureText(formattedTime).width / 2, 30);

  ctx.fillStyle = '#5ad5ff';
  ctx.font = '700 16px "Press Start 2P", monospace';
  const livesLabel = 'LIVES';
  const right = ctx.canvas.width - 24 - ctx.measureText(livesLabel).width;
  ctx.fillText(livesLabel, right, 12);

  const lifeIconSize = 16;
  for (let i = 0; i < Math.max(player.lives, 0); i++) {
    const x = ctx.canvas.width - 24 - lifeIconSize - i * (lifeIconSize + 8);
    drawLifeIcon(ctx, x, 30, lifeIconSize, player.isPowered());
  }
}

function drawLifeIcon(ctx, x, y, size, powered) {
  ctx.save();
  ctx.translate(x, y);
  const suit = powered ? '#5ad5ff' : '#3ca754';
  ctx.fillStyle = '#8b4b1e';
  ctx.fillRect(2, 0, size - 4, 3);
  ctx.fillStyle = '#f0c799';
  ctx.fillRect(4, 3, size - 8, 5);
  ctx.fillStyle = suit;
  ctx.fillRect(3, 8, size - 6, 6);
  ctx.fillStyle = '#0b1b21';
  ctx.fillRect(3, size - 4, 5, 4);
  ctx.fillRect(size - 8, size - 4, 5, 4);
  ctx.restore();
}

function overlay(ctx, title, subtitle) {
  const w = 420, h = 160;
  const x = (ctx.canvas.width - w) / 2;
  const y = (ctx.canvas.height - h) / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#f8f8ff';
  ctx.font = '700 32px "Press Start 2P", monospace';
  ctx.fillText(title, x + 36, y + 72);
  ctx.font = '700 18px "Press Start 2P", monospace';
  ctx.fillText(subtitle, x + 48, y + 108);
}

function padScore(score) {
  return score.toString().padStart(6, '0');
}

function formatTime(time) {
  const seconds = Math.floor(time % 60).toString().padStart(2, '0');
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  return `${minutes}${seconds}`;
}
