/*
 * Main game logic. See AGENTS.md for project conventions and POSTERITY.md for
 * architectural notes.
 */

const tileSize = 32;
const viewWidth = 20;
const viewHeight = 15;
const worldWidth = 50;
const worldHeight = 100;

const TILE = {
  EMPTY: 0,
  DIRT: 1,
  GOLD: 2,
  DIAMOND: 3,
  ARTIFACT: 4,
  SHOP: 5,
  GAS: 6
};

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.world = [];
    this.player = {
      x: Math.floor(worldWidth / 2),
      y: 0,
      fuel: 100,
      cash: 0,
      drill: 1,
      lift: 1,
      inventory: {}
    };
    this.message = '';
    this.initWorld();
    this.bindKeys();
    requestAnimationFrame(() => this.gameLoop());
  }

  initWorld() {
    for (let y = 0; y < worldHeight; y++) {
      this.world[y] = [];
      for (let x = 0; x < worldWidth; x++) {
        if (y === 0) {
          if (x === 2) {
            this.world[y][x] = TILE.SHOP;
          } else if (x === worldWidth - 3) {
            this.world[y][x] = TILE.GAS;
          } else {
            this.world[y][x] = TILE.EMPTY;
          }
        } else {
          const depth = y / worldHeight;
          let tile = TILE.DIRT;
          if (Math.random() < 0.02 + depth * 0.1) tile = TILE.GOLD;
          if (y > worldHeight * 0.6 && Math.random() < 0.01 + depth * 0.05) tile = TILE.DIAMOND;
          if (y > worldHeight * 0.8 && Math.random() < 0.005 + depth * 0.02) tile = TILE.ARTIFACT;
          this.world[y][x] = tile;
        }
      }
    }
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

  move(dx, dy) {
    if (this.player.fuel <= 0) return;
    const newX = this.player.x + dx;
    const newY = this.player.y + dy;
    if (newX < 0 || newX >= worldWidth || newY < 0 || newY >= worldHeight) return;
    if (dy > 0 && newY > this.player.drill * 30) {
      this.message = 'Need better drill!';
      return;
    }
    const target = this.world[newY][newX];
    if (target === TILE.DIRT || target === TILE.GOLD || target === TILE.DIAMOND || target === TILE.ARTIFACT) {
      this.collect(target);
      this.world[newY][newX] = TILE.EMPTY;
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
      [TILE.ARTIFACT]: 'Artifact'
    }[tile];
    this.player.inventory[name] = (this.player.inventory[name] || 0) + 1;
    if (tile === TILE.ARTIFACT) {
      this.message = `Found alien artifact!`;
    }
  }

  refuel() {
    if (this.world[this.player.y][this.player.x] === TILE.GAS && this.player.y === 0) {
      this.player.fuel = 100;
      this.message = 'Refueled!';
    }
  }

  sell() {
    if (this.world[this.player.y][this.player.x] !== TILE.SHOP || this.player.y !== 0) return;
    let total = 0;
    for (const [k, v] of Object.entries(this.player.inventory)) {
      const value = { Gold: 10, Diamond: 50, Artifact: 100 }[k] || 0;
      total += value * v;
    }
    if (total > 0) {
      this.player.cash += total;
      this.player.inventory = {};
      this.message = `Sold loot for ${total}`;
    }
  }

  upgrade() {
    if (this.world[this.player.y][this.player.x] !== TILE.SHOP || this.player.y !== 0) return;
    const cost = 100 * this.player.drill;
    if (this.player.cash >= cost && this.player.drill < 3) {
      this.player.cash -= cost;
      this.player.drill += 1;
      this.message = 'Drill upgraded!';
    }
  }

  drawTile(tile, x, y) {
    const colors = {
      [TILE.EMPTY]: '#000',
      [TILE.DIRT]: '#654321',
      [TILE.GOLD]: '#daa520',
      [TILE.DIAMOND]: '#b9f2ff',
      [TILE.ARTIFACT]: '#ff00ff',
      [TILE.SHOP]: '#00ff00',
      [TILE.GAS]: '#ff0000'
    };
    this.ctx.fillStyle = colors[tile] || '#000';
    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
  }

  draw() {
    const startX = Math.max(0, this.player.x - Math.floor(viewWidth / 2));
    const startY = Math.max(0, this.player.y - Math.floor(viewHeight / 2));
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
    this.ctx.fillStyle = '#ffffff';
    const px = (this.player.x - startX) * tileSize;
    const py = (this.player.y - startY) * tileSize;
    this.ctx.fillRect(px, py, tileSize, tileSize);
  }

  updateHUD() {
    document.getElementById('fuel').textContent = `Fuel: ${this.player.fuel}`;
    document.getElementById('cash').textContent = `Cash: ${this.player.cash}`;
    document.getElementById('message').textContent = this.message;
    this.message = '';
  }

  gameLoop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.draw();
    this.updateHUD();
    requestAnimationFrame(() => this.gameLoop());
  }
}

window.onload = () => {
  new Game();
};
