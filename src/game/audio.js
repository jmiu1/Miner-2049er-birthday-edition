import { CONFIG } from './config.js';

const AudioCtx = window.AudioContext || window.webkitAudioContext || null;
let ctx = null;
let unlocked = false;

const SOUND_PRESETS = {
  paint:  { freq: 880,  duration: 0.08, type: 'square', gain: 0.12 },
  power:  { freq: 520,  duration: 0.35, type: 'triangle', gain: 0.2 },
  enemy:  { freq: 330,  duration: 0.4, type: 'square', gain: 0.25 },
  death:  { freq: 110,  duration: 0.6, type: 'sawtooth', gain: 0.3 },
};

function ensureContext() {
  if (!AudioCtx) return null;
  if (!ctx) {
    ctx = new AudioCtx();
    setupUnlock();
  }
  return ctx;
}

function setupUnlock() {
  if (!ctx || unlocked) return;
  const unlock = () => {
    if (!ctx) return;
    ctx.resume();
    unlocked = true;
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('pointerdown', unlock);
  };
  window.addEventListener('keydown', unlock);
  window.addEventListener('pointerdown', unlock);
}

export function playSound(name) {
  const preset = SOUND_PRESETS[name];
  if (!preset || CONFIG.MUTED) return;
  const audio = ensureContext();
  if (!audio) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = preset.type;
  osc.frequency.setValueAtTime(preset.freq, now);
  gain.gain.setValueAtTime(preset.gain, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + preset.duration + 0.05);
}
