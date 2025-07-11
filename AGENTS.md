# AGENTS

This repository contains an HTML5 game built with vanilla JavaScript.

## Workflow

- Source files live under `src/`.
- Use 2-space indentation for all JavaScript and CSS.
- Keep HTML concise and semantic.
- Document significant changes in `CHANGELOG.md`.
- Architecture decisions belong in `POSTERITY.md`.
- Run the Node scripts in `tests/` before committing changes.
- Assets live under `src/svg/` and `src/audio/`.
- Use the root `.gitignore` to keep OS and editor artifacts out of version control.
- Touch controls are wired in `bindTouchControls()` and rely on IDs defined in
  `index.html`. Ensure any new controls keep to this pattern and maintain
  responsive sizing via `resizeCanvas()`.
- Upgrades are handled via a DOM overlay with id `upgradeMenu`. `upgrade()`
  populates this menu using `showUpgradeMenu()` and calculates costs as
  `baseCost * level` for each stat. Keep new UI elements minimal and reuse this
  pattern when adding further upgrades.
- Story scenes use a separate overlay with id `storyOverlay`. Display text via
  `showStory()` to keep the canvas visible and interactions simple.

