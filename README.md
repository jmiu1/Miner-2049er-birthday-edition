# Miner-2049er-birthday-edition
A level of Miner 2049er rendered to play in a browser for a birthday gift to my Dad. Happy bday Dad!

A tiny, single-level, web-based platformer inspired by classic “paint-the-floor” gameplay. No build step; just static files.

## How to Launch
Go to the hosted index.html here: https://jmiu1.github.io/miner-2049er-birthday-edition/

OR

Download the file and open it in a browser

## Play locally
- Open `index.html` in a modern browser **or** run a simple server:
  ```bash
  npx serve .
  # then open the printed URL
  ```

## Controls
- ← / → : move
- Space / Z : jump
- ↑ / ↓ : climb ladders
- R : restart
- P : pause, M : mute (future use)

## Deploy (GitHub Pages)
1. Create a new repo; repo name will be endpoint name (see step 4)
2. Commit and push all files.
3. In GitHub → **Settings → Pages**, set **Source** to **Deploy from a branch**, **Branch** = `main`, folder = `/ (root)`.
4. Your site will appear at `https://<your_username>.github.io/miner-2049er-birthday-edition/`.

## Structure
```
index.html
src/
  main.js
  engine/
    loop.js
    input.js
  game/
    config.js
    level1.json
    tiles.js
    player.js
    enemies.js
    rules.js
    camera.js
    renderer.js
assets/ (reserved for future sprites/sfx)
```

## Notes
- All rendering is rectangles for now to keep the logic clear. Swap in sprites later by editing `renderer.js`.
- Physics is fixed-timestep for consistent feel. Collisions are tile-based for simplicity.
