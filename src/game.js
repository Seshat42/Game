/*
 * Main game logic. See AGENTS.md for project conventions and POSTERITY.md for
 * architectural notes.
 */

const tileSize = 32;
const viewWidth = 20;
const viewHeight = 15;
// expanded for horizontal side scrolling (see POSTERITY.md)
const worldWidth = 200;
const worldHeight = 100;

const TILE = {
  EMPTY: 0,
  DIRT: 1,
  GOLD: 2,
  DIAMOND: 3,
  ARTIFACT: 4,
  IRON: 5,
  SILVER: 6,
  SHOP: 7,
  GAS: 8
};

function generateWorld() {
  const world = [];
  for (let y = 0; y < worldHeight; y++) {
    world[y] = [];
    for (let x = 0; x < worldWidth; x++) {
      if (y === 0) {
        if (x === 2) {
          world[y][x] = TILE.SHOP;
        } else if (x === worldWidth - 3) {
          world[y][x] = TILE.GAS;
        } else {
          world[y][x] = TILE.EMPTY;
        }
      } else {
        const depth = y / worldHeight;
        let tile = TILE.DIRT;
        if (Math.random() < 0.1 + depth * 0.2) tile = TILE.IRON;
        if (Math.random() < 0.05 + depth * 0.15) tile = TILE.SILVER;
        if (Math.random() < 0.02 + depth * 0.1) tile = TILE.GOLD;
        if (y > worldHeight * 0.6 && Math.random() < 0.01 + depth * 0.05) tile = TILE.DIAMOND;
        if (y > worldHeight * 0.8 && Math.random() < 0.005 + depth * 0.02) tile = TILE.ARTIFACT;
        if (Math.random() < 0.001) tile = TILE.GAS;
        world[y][x] = tile;
      }
    }
  }
  return world;
}

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.world = [];
    this.player = {
      x: Math.floor(worldWidth / 2),
      y: 0,
      fuelCapacity: 100,
      fuel: 100,
      cash: 0,
      drill: 1,
      liftStrength: 1,
      hull: 1,
      inventory: {},
      artifacts: []
    };
    this.message = '';
    this.images = {};
    ['dirt','gold','diamond','artifact','shop','gas','iron','silver','player'].forEach(n => {
      const img = new Image();
      img.src = `src/svg/${n}.svg`;
      this.images[n] = img;
    });
    this.loadProgress();
    this.initWorld();
    this.bindKeys();
    this.bindTouchControls();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    requestAnimationFrame(() => this.gameLoop());
  }

  initWorld() {
    this.world = generateWorld();
  }

  bindKeys() {
    window.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowLeft':
          this.move(-1, 0);
          break;
        case 'ArrowRight':
          this.move(1, 0);
          break;
        case 'ArrowUp':
          this.move(0, -1);
          break;
        case 'ArrowDown':
          this.move(0, 1);
          break;
        case 'g':
        case 'G':
          this.refuel();
          break;
        case 's':
        case 'S':
          this.sell();
          break;
        case 'u':
        case 'U':
          this.upgrade();
          break;
      }
    });
  }

  bindTouchControls() {
    const actions = {
      'btn-left': () => this.move(-1, 0),
      'btn-right': () => this.move(1, 0),
      'btn-up': () => this.move(0, -1),
      'btn-down': () => this.move(0, 1),
      'btn-dig': () => this.move(0, 1),
      'btn-refuel': () => this.refuel(),
      'btn-sell': () => this.sell(),
      'btn-upgrade': () => this.upgrade()
    };
    Object.keys(actions).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = actions[id];
      el.addEventListener('touchstart', e => {
        e.preventDefault();
        handler();
      });
      el.addEventListener('touchend', e => e.preventDefault());
    });

    this.canvas.addEventListener('pointerup', e => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const cx = Math.floor((e.clientX - rect.left) * scaleX / tileSize);
      const cy = Math.floor((e.clientY - rect.top) * scaleY / tileSize);
      const startX = Math.min(
        worldWidth - viewWidth,
        Math.max(0, this.player.x - Math.floor(viewWidth / 2))
      );
      const startY = Math.min(
        worldHeight - viewHeight,
        Math.max(0, this.player.y - Math.floor(viewHeight / 2))
      );
      const tx = startX + cx;
      const ty = startY + cy;
      const dx = tx - this.player.x;
      const dy = ty - this.player.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) {
        this.move(dx, dy);
      }
    });
  }

  resizeCanvas() {
    const ratio = viewWidth / viewHeight;
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width / height > ratio) {
      width = height * ratio;
    } else {
      height = width / ratio;
    }
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
  }

  move(dx, dy) {
    if (this.player.fuel <= 0) return;
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    if (newX < 0 || newX >= worldWidth || newY < 0 || newY >= worldHeight) return;
    if (dy > 0 && newY > this.player.drill * 30) {
      this.message = 'Need better drill!';
      return;
    }
    if (dy < 0 && this.player.y > this.player.liftStrength * 20) {
      this.message = 'Lift too weak!';
      return;
    }
    const target = this.world[newY][newX];
    if (target === TILE.DIRT || target === TILE.IRON || target === TILE.SILVER || target === TILE.GOLD || target === TILE.DIAMOND || target === TILE.ARTIFACT) {
      this.collect(target);
      this.world[newY][newX] = TILE.EMPTY;
      document.getElementById('sndDrill').play();
    } else if (target === TILE.SHOP || target === TILE.GAS || target === TILE.EMPTY) {
      // passable
    } else {
      return;
    }
    this.player.x = newX;
    this.player.y = newY;
    this.player.fuel -= 1;
  }

  collect(tile) {
    if (tile === TILE.DIRT) return;
    const name = {
      [TILE.GOLD]: 'Gold',
      [TILE.DIAMOND]: 'Diamond',
      [TILE.ARTIFACT]: 'Artifact',
      [TILE.IRON]: 'Iron',
      [TILE.SILVER]: 'Silver'
    }[tile];
    this.player.inventory[name] = (this.player.inventory[name] || 0) + 1;
    document.getElementById('sndCollect').play();
    if (tile === TILE.ARTIFACT) {
      this.message = `Found alien artifact!`;
      this.player.artifacts.push(`Artifact ${this.player.artifacts.length + 1}`);
    }
  }

  refuel() {
    if (this.world[this.player.y][this.player.x] === TILE.GAS) {
      this.player.fuel = this.player.fuelCapacity;
      this.message = 'Refueled!';
    }
  }

  sell() {
    if (this.world[this.player.y][this.player.x] !== TILE.SHOP || this.player.y !== 0) return;
    let total = 0;
    for (const [k, v] of Object.entries(this.player.inventory)) {
      const value = { Iron: 2, Silver: 5, Gold: 10, Diamond: 50, Artifact: 100 }[k] || 0;
      total += value * v;
    }
    if (total > 0) {
      this.player.cash += total;
      this.player.inventory = {};
      this.message = `Sold loot for ${total}`;
      this.saveProgress();
    }
  }

  upgrade() {
    if (this.world[this.player.y][this.player.x] !== TILE.SHOP || this.player.y !== 0) return;
    const choices = ['drill', 'fuelCapacity', 'hull', 'liftStrength'];
    const choice = prompt('Upgrade: drill, fuelCapacity, hull, liftStrength');
    if (!choices.includes(choice)) return;
    const level = this.player[choice];
    const cost = 100 * level;
    if (this.player.cash >= cost) {
      this.player.cash -= cost;
      this.player[choice] += 1;
      if (choice === 'fuelCapacity') this.player.fuel = this.player.fuelCapacity;
      this.message = `${choice} upgraded!`;
      document.getElementById('sndShop').play();
      this.saveProgress();
    }
  }

  drawTile(tile, x, y) {
    const mapping = {
      [TILE.DIRT]: 'dirt',
      [TILE.GOLD]: 'gold',
      [TILE.DIAMOND]: 'diamond',
      [TILE.ARTIFACT]: 'artifact',
      [TILE.SHOP]: 'shop',
      [TILE.GAS]: 'gas',
      [TILE.IRON]: 'iron',
      [TILE.SILVER]: 'silver'
    };
    const imgName = mapping[tile];
    if (imgName) {
      this.ctx.drawImage(this.images[imgName], x * tileSize, y * tileSize, tileSize, tileSize);
    } else {
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  draw() {
    const startX = Math.min(
      worldWidth - viewWidth,
      Math.max(0, this.player.x - Math.floor(viewWidth / 2))
    );
    const startY = Math.min(
      worldHeight - viewHeight,
      Math.max(0, this.player.y - Math.floor(viewHeight / 2))
    );
    for (let y = 0; y < viewHeight; y++) {
      for (let x = 0; x < viewWidth; x++) {
        const wx = startX + x;
        const wy = startY + y;
        if (wx < worldWidth && wy < worldHeight) {
          this.drawTile(this.world[wy][wx], x, y);
        }
      }
    }
    // draw player
    const px = (this.player.x - startX) * tileSize;
    const py = (this.player.y - startY) * tileSize;
    this.ctx.drawImage(this.images.player, px, py, tileSize, tileSize);
  }

  updateHUD() {
    document.getElementById('fuel').textContent = `Fuel: ${this.player.fuel}`;
    document.getElementById('cash').textContent = `Cash: ${this.player.cash}`;
    document.getElementById('message').textContent = this.message;
    document.getElementById('artifacts').textContent = `Artifacts: ${this.player.artifacts.length}`;
    this.message = '';
  }

  saveProgress() {
    localStorage.setItem('alienMinerSave', JSON.stringify({
      player: this.player
    }));
  }

  loadProgress() {
    const data = localStorage.getItem('alienMinerSave');
    if (data) {
      const parsed = JSON.parse(data);
      Object.assign(this.player, parsed.player);
    }
  }

  gameLoop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();
    this.updateHUD();
    requestAnimationFrame(() => this.gameLoop());
  }
}

window.onload = () => {
  document.getElementById('newGame').onclick = () => {
    localStorage.removeItem('alienMinerSave');
    new Game();
  };
  document.getElementById('continueGame').onclick = () => {
    new Game();
  };
};

if (typeof module !== 'undefined') {
  module.exports = { Game, TILE, worldWidth, worldHeight, generateWorld };
}
