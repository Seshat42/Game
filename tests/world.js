global.window = {};
global.document = { getElementById: () => ({}) };
const { generateWorld, worldHeight, TILE } = require('../src/game');

const world = generateWorld();
const topRow = world[Math.floor(worldHeight * 0.3)];
const bottomRow = world[worldHeight - 1];

function count(row, tile) {
  return row.filter(t => t === tile).length;
}

if (count(bottomRow, TILE.DIAMOND) <= count(topRow, TILE.DIAMOND)) {
  throw new Error('Diamonds should increase with depth');
}
console.log('World generation test passed');
