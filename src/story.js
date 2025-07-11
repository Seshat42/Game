const story = {
  intro: `You are Dr. Rana, lead archaeologist for the Terra Nova expedition.\nAfter years of scanning the outer rim you\u2019ve discovered signs of an ancient civilization buried beneath this barren planet.\nCorporate sponsors only care about the minerals, so your digging mission doubles as a covert search for knowledge.\nEvery shovel of dirt brings you closer to the truth.`,
  artifacts: [
    {
      name: 'Ancient Beacon',
      description: 'A crystalline device that emits a faint pulse. When activated it resonates with other relics.'
    },
    {
      name: 'Crystal Codex',
      description: 'Alien glyphs cover its facets. The codex hums softly when near the beacon.'
    },
    {
      name: 'Stellar Compass',
      description: 'This pointer shifts even when your pod stands still. It guides you toward a final destination.'
    }
  ],
  ending: `With all relics assembled, a holographic map projects from the beacon.\nThe message invites humanity to rediscover lost wisdom among the stars.\nYou set a course for the coordinates and prepare for a new journey.`
};

if (typeof module !== 'undefined') {
  module.exports = { story };
}

