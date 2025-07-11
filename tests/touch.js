// stub document and window before requiring game code
const created = {};
['btn-left','btn-right','btn-up','btn-down','btn-dig','btn-refuel','btn-sell','btn-upgrade'].forEach(id => {
  created[id] = { addEventListener: () => {} };
});
created.gameCanvas = {
  addEventListener: () => {},
  getContext: () => ({ clearRect: () => {}, drawImage: () => {} }),
  style: {}
};

global.document = { getElementById: id => created[id] };
global.window = {
  addEventListener: () => {},
  innerWidth: 640,
  innerHeight: 480,
  requestAnimationFrame: () => {}
};
global.requestAnimationFrame = () => {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.Image = function() { return {}; };

const { Game } = require('../src/game');

new Game();
console.log('Touch binding test stub executed');

