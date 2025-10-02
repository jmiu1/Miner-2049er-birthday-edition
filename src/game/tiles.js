import { CONFIG } from './config.js';

let current = null;
let paintedMask = null; // mirrors paint layer; 1 when painted

export async function loadLevel(url) {
  const res = await fetch(url);
  const lvl = await res.json();
  current = lvl;
  // initialize painted mask
  const paint = getLayer('paint').data;
  paintedMask = paint.map(v => 0);
  return current;
}

export function getLevel() { return current; }
export function getLayer(name) { return current.layers.find(l => l.name === name || l.type === name); }

export function isSolidAt(px, py) {
  const {tileSize} = current;
  const x = Math.floor(px / tileSize);
  const y = Math.floor(py / tileSize);
  if (x < 0 || y < 0 || x >= current.width || y >= current.height) return true;
  return getLayer('solid').data[y*current.width + x] === 1;
}

export function isLadderAt(px, py) {
  const {tileSize} = current;
  const x = Math.floor(px / tileSize);
  const y = Math.floor(py / tileSize);
  if (x < 0 || y < 0 || x >= current.width || y >= current.height) return false;
  return getLayer('ladder').data[y*current.width + x] === 1;
}

export function paintUnderfoot(px, py) {
  const {tileSize} = current;
  const x = Math.floor(px / tileSize);
  const y = Math.floor(py / tileSize);
  if (x < 0 || y < 0 || x >= current.width || y >= current.height) return;
  const idx = y*current.width + x;
  const paint = getLayer('paint').data;
  if (paint[idx] === 1) paintedMask[idx] = 1;
}

export function getPaintStats() {
  const paint = getLayer('paint').data;
  let total = 0, painted = 0;
  for (let i=0;i<paint.length;i++) {
    if (paint[i] === 1) {
      total++;
      if (paintedMask[i] === 1) painted++;
    }
  }
  return { total, painted };
}

export function resetPaint() {
  const paint = getLayer('paint').data;
  paintedMask = paint.map(v => 0);
}

export function getPaintMask() { return paintedMask; }
