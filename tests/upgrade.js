function upgradeCost(level) {
  return 100 * level;
}

if (upgradeCost(1) !== 100 || upgradeCost(3) !== 300) {
  throw new Error('Upgrade cost scaling broken');
}
console.log('Upgrade cost test passed');
