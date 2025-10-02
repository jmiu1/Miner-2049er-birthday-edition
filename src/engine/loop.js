export function createLoop(update, draw) {
  let acc = 0;
  let last = performance.now();
  const STEP = 1/60; // seconds
  let running = true;
  let rafId = null;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    if (!running) return;
    let dt = (now - last) / 1000;
    if (dt > 0.25) dt = 0.25; // avoid spiral
    last = now;
    acc += dt;

    while (acc >= STEP) {
      update(STEP);
      acc -= STEP;
    }
    draw();
  }

  return {
    start() { last = performance.now(); rafId = requestAnimationFrame(frame); },
    stop() { if (rafId) cancelAnimationFrame(rafId); },
    togglePause() { running = !running; }
  };
}
