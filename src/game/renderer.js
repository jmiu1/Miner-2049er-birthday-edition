import { CONFIG } from './config.js';
import { getLayer, getPaintMask } from './tiles.js';

export function render(ctx, cam, level, player, enemies, rules) {
  const scale = CONFIG.WORLD_SCALE;
  ctx.setTransform(scale, 0, 0, scale, -cam.x*scale, -cam.y*scale);
  // clear
  ctx.fillStyle = '#0b0f14';
  ctx.fillRect(cam.x, cam.y, cam.vw/scale, cam.vh/scale);

  drawTiles(ctx, level);
  drawPaint(ctx, level);
  drawLadders(ctx, level);

  // Player
  if (!player.dead) {
    ctx.fillStyle = player.invuln > 0 ? '#ff9fb6' : '#8bd6ff';
    const r = player.rect();
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }

  // Enemies
  ctx.fillStyle = '#ff6464';
  for (const e of enemies) {
    const r = e.rect();
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }

  // Overlays
  ctx.setTransform(1,0,0,1,0,0);
  if (rules.gameover) {
    overlay(ctx, 'GAME OVER', 'Press R to restart');
  } else if (rules.win) {
    overlay(ctx, 'YOU WIN!', 'Press R to play again');
  }
}

function drawTiles(ctx, level) {
  const solid = getLayer('solid').data;
  const W = level.width, H = level.height, T = level.tileSize;
  ctx.fillStyle = '#233041';
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
        ctx.fillStyle = painted[i] ? '#2bd065' : '#d6a400';
        ctx.fillRect(x*T+1, y*T+1, T-2, T-2);
      }
    }
  }
}

function drawLadders(ctx, level) {
  const ladder = getLayer('ladder').data;
  const W = level.width, H = level.height, T = level.tileSize;
  ctx.strokeStyle = '#c28c5c';
  ctx.lineWidth = 2;
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {
      if (ladder[y*W + x] === 1) {
        const px = x*T, py = y*T;
        ctx.strokeRect(px+4, py+1, T-8, T-2);
      }
    }
  }
}

function overlay(ctx, title, subtitle) {
  const w = 420, h = 160;
  const x = (ctx.canvas.width - w) / 2;
  const y = (ctx.canvas.height - h) / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e9e9ef';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.fillText(title, x+24, y+64);
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(subtitle, x+24, y+100);
}
