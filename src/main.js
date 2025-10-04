import { createLoop } from './engine/loop.js';
import { Input } from './engine/input.js';
import { CONFIG } from './game/config.js';
import { loadLevel } from './game/tiles.js';
import { Player } from './game/player.js';
import { Enemy } from './game/enemies.js';
import { Powerup } from './game/powerups.js';
import { addScore, updateRules, resetRules, getRules } from './game/rules.js';
import { Camera } from './game/camera.js';
import { render } from './game/renderer.js';
import { playSound } from './game/audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const input = new Input();
let camera, player, enemies = [], level, powerups = [];

async function boot() {
  level = await loadLevel('./src/game/level1.json');
  resetRules();
  const start = level.entities.find(e => e.type === 'playerStart') || {x: 2 * CONFIG.TILE, y: 2 * CONFIG.TILE};
  player = new Player(start.x, start.y);
  enemies = level.entities.filter(e => e.type === 'enemy').map(e => new Enemy(e.x, e.y, e.patrolMinX, e.patrolMaxX));
  powerups = level.entities
    .filter(e => e.type === 'powerup')
    .map(e => new Powerup(e.x, e.y, e.kind));
  const viewWidth = canvas.width / CONFIG.WORLD_SCALE;
  const viewHeight = canvas.height / CONFIG.WORLD_SCALE;
  camera = new Camera(0, 0, viewWidth, viewHeight, level.width * CONFIG.TILE, level.height * CONFIG.TILE);
  camera.follow(player.x, player.y);

  const loop = createLoop(update, draw);
  loop.start();

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') restart();
    if (e.key.toLowerCase() === 'p') loop.togglePause();
    if (e.key.toLowerCase() === 'm') CONFIG.MUTED = !CONFIG.MUTED;
  });
}

function restart() {
  player.reset(level);
  enemies.forEach(en => en.reset());
  powerups.forEach(p => p.reset());
  resetRules();
}

function update(dt) {
  // Update world
  player.update(dt, input, level);
  enemies.forEach(en => en.update(dt, level));

  // Collisions: player with enemies
  for (const en of enemies) {
    if (!en.isActive()) continue;
    if (rectOverlap(player.rect(), en.rect())) {
      if (player.isPowered()) {
        en.defeat();
        addScore(800);
        playSound('enemy');
      } else {
        const prevLives = player.lives;
        player.loseLife(level);
        if (player.lives < prevLives) playSound('death');
      }
      break;
    }
  }

  // Powerups
  for (const power of powerups) {
    if (!power.active) continue;
    if (rectOverlap(player.rect(), power.rect())) {
      power.collect();
      player.grantPower(7);
      addScore(200);
      playSound('power');
    }
  }

  // Rules (win/lose + painting while standing)
  updateRules(dt, level, player);

  // Camera follow
  camera.follow(player.x, player.y);
}

function draw() {
  render(ctx, camera, level, player, enemies, powerups, getRules());
}

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

boot();
