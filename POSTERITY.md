# POSTERITY

## Why vanilla JavaScript
The game uses the Canvas API directly to avoid dependency management and keep the
repository lightweight. This choice matches the limited environment where external
libraries might not be easily fetched.

## File structure
All code is organized within `src/` to keep the project tidy.

## Depth scaling and SVG assets
Resource probabilities increase with depth to add challenge (see `generateWorld` in `src/game.js`). SVG images were chosen for tiles to keep the asset footprint small while allowing simple animations.

