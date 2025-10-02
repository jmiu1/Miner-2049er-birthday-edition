import { createLoop } from './engine/loop.js';
import { Input } from './engine/input.js';
import { CONFIG } from './game/config.js';
import { loadLevel, getPaintStats } from './game/tiles.js';
import { Player } from './game/player.js';
import { Enemy } from './game/enemies.js';
import { updateRules, resetRules, getRules } from './game/rules.js';
import { Camera } from './game/camera.js';
import { render } from './game/renderer.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const ui = {
  lives: document.getElementById('lives'),
  painted: document.getElementById('painted'),
  paintTotal: document.getElementById('paintTotal'),
  timer: document.getElementById('timer'),
};

const input = new Input();
let camera, player, enemies = [], level;

async function boot() {
  level = await loadLevel('./src/game/level1.json');
  resetRules();
  const start = level.entities.find(e => e.type === 'playerStart') || {x: 2 * CONFIG.TILE, y: 2 * CONFIG.TILE};
  player = new Player(start.x, start.y);
  enemies = level.entities.filter(e => e.type === 'enemy').map(e => new Enemy(e.x, e.y, e.patrolMinX, e.patrolMaxX));
  const viewWidth = canvas.width / CONFIG.WORLD_SCALE;
  const viewHeight = canvas.height / CONFIG.WORLD_SCALE;
  camera = new Camera(0, 0, viewWidth, viewHeight, level.width * CONFIG.TILE, level.height * CONFIG.TILE);
  camera.follow(player.x, player.y);

  const stats = getPaintStats(level);
  ui.paintTotal.textContent = stats.total;
  ui.painted.textContent = stats.painted;

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
  resetRules();
}

function update(dt) {
  // Update world
  player.update(dt, input, level);
  enemies.forEach(en => en.update(dt, level));

  // Collisions: player with enemies
  for (const en of enemies) {
    if (player.overlaps(en)) {
      player.loseLife(level);
      break;
    }
  }

  // Rules (win/lose + painting while standing)
  updateRules(dt, level, player);
  const stats = getPaintStats(level);
  ui.painted.textContent = stats.painted;
  ui.lives.textContent = player.lives.toString();
  ui.timer.textContent = getRules().time.toFixed(1);

  // Camera follow
  camera.follow(player.x, player.y);
}

function draw() {
  render(ctx, camera, level, player, enemies, getRules());
}

boot();
