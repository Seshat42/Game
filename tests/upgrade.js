function cost(baseCost, level) {
  return baseCost * level;
}

const upgrades = {
  drillSpeed: 100,
  gasTankSize: 100,
  hullStrength: 100,
  liftStrength: 100,
  storageCapacity: 100
};

Object.entries(upgrades).forEach(([name, base]) => {
  if (cost(base, 1) !== base || cost(base, 3) !== base * 3) {
    throw new Error(`Cost formula broken for ${name}`);
  }
});
console.log('Upgrade cost test passed');
