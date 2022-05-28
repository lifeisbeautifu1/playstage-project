var Ship = require('./ship.js');
var Settings = require('./settings.js');

/**
 * Player constructor
 * @param {type} id Socket ID
 */
function Player(id) {
  var i;

  this.id = id;
  this.shots = Array(Settings.gridRows * Settings.gridCols);
  this.shipGrid = Array(Settings.gridRows * Settings.gridCols);
  this.ships = [];

  for (i = 0; i < Settings.gridRows * Settings.gridCols; i++) {
    this.shots[i] = 0;
    this.shipGrid[i] = -1;
  }

  if (!this.createRandomShips()) {
    // Random placement of ships failed. Use fallback layout (should rarely happen).
    this.ships = [];
    this.createShips();
  }
}

/**
 * Fire shot on grid
 * @param {type} gridIndex
 * @returns {Boolean} True if hit
 */
Player.prototype.shoot = function (gridIndex) {
  if (this.shipGrid[gridIndex] >= 0) {
    // Hit!
    this.ships[this.shipGrid[gridIndex]].hits++;
    if (
      this.ships[this.shipGrid[gridIndex]].hits ===
      this.ships[this.shipGrid[gridIndex]].size
    ) {
      if (this.ships[this.shipGrid[gridIndex]].horizontal) {
        let { x, y, size } = this.ships[this.shipGrid[gridIndex]];

        for (let i = 0; i < size; ++i) {
          let index = y * 10 + x + i;
          if (index - 10 >= 0) {
            this.shots[index - 10] = 1;
          }
          if (index + 10 < 100) {
            this.shots[index + 10] = 1;
          }
          if (i === 0) {
            if ((index - 1) % 10 !== 9) {
              this.shots[index - 1] = 1;
            }
            if ((index - 11) % 10 !== 9) {
              this.shots[index - 11] = 1;
            }
            if ((index + 9) % 10 !== 9) {
              this.shots[index + 9] = 1;
            }
          }
          if (i === size - 1) {
            if ((index + 1) % 10 !== 0) {
              this.shots[index + 1] = 1;
            }
            if ((index + 11) % 10 !== 0) {
              this.shots[index + 11] = 1;
            }
            if ((index - 9) % 10 !== 9) {
              this.shots[index - 9] = 1;
            }
          }
        }
      } else {
        let { x, y, size } = this.ships[this.shipGrid[gridIndex]];
        for (let i = 0; i < size; ++i) {
          let index = (y + i) * 10 + x;
          if ((index - 1) % 10 !== 9) this.shots[index - 1] = 1;
          if ((index + 1) % 10 !== 0) this.shots[index + 1] = 1;

          if (i === 0) {
            if (index - 10 >= 0) {
              this.shots[index - 10] = 1;
            }
            if (index - 9 >= 0 && (index - 9) % 10 !== 0) {
              this.shots[index - 9] = 1;
            }
            if (index - 11 >= 0 && (index - 11) % 10 !== 9) {
              this.shots[index - 11] = 1;
            }
          }
          if (i === size - 1) {
            if (index + 10 < 100) {
              this.shots[index + 10] = 1;
            }
            if (index + 9 < 100 && (index + 9) % 10 !== 9) {
              this.shots[index + 9] = 1;
            }
            if (index + 11 < 100 && (index + 11) % 10 !== 0) {
              this.shots[index + 11] = 1;
            }
          }
        }
      }
    }
    this.shots[gridIndex] = 2;
    return true;
  } else {
    // Miss
    this.shots[gridIndex] = 1;
    return false;
  }
};

/**
 * Get an array of sunk ships
 * @returns {undefined}
 */
Player.prototype.getSunkShips = function () {
  var i,
    sunkShips = [];

  for (i = 0; i < this.ships.length; i++) {
    if (this.ships[i].isSunk()) {
      sunkShips.push(this.ships[i]);
    }
  }

  return sunkShips;
};

/**
 * Get the number of ships left
 * @returns {Number} Number of ships left
 */
Player.prototype.getShipsLeft = function () {
  var i,
    shipCount = 0;

  for (i = 0; i < this.ships.length; i++) {
    if (!this.ships[i].isSunk()) {
      shipCount++;
    }
  }

  return shipCount;
};

/**
 * Create ships and place them randomly in grid
 * @returns {Boolean}
 */
Player.prototype.createRandomShips = function () {
  var shipIndex;

  for (shipIndex = 0; shipIndex < Settings.ships.length; shipIndex++) {
    ship = new Ship(Settings.ships[shipIndex]);

    if (!this.placeShipRandom(ship, shipIndex)) {
      return false;
    }

    this.ships.push(ship);
  }

  return true;
};

/**
 * Try to place a ship randomly in grid without overlapping another ship.
 * @param {Ship} ship
 * @param {Number} shipIndex
 * @returns {Boolean}
 */
Player.prototype.placeShipRandom = function (ship, shipIndex) {
  var i,
    j,
    gridIndex,
    xMax,
    yMax,
    tryMax = 25;

  for (i = 0; i < tryMax; i++) {
    ship.horizontal = Math.random() < 0.5;

    xMax = ship.horizontal
      ? Settings.gridCols - ship.size + 1
      : Settings.gridCols;
    yMax = ship.horizontal
      ? Settings.gridRows
      : Settings.gridRows - ship.size + 1;

    ship.x = Math.floor(Math.random() * xMax);
    ship.y = Math.floor(Math.random() * yMax);

    if (!this.checkShipOverlap(ship) && !this.checkShipAdjacent(ship)) {
      // success - ship does not overlap or is adjacent to other ships
      // place ship array-index in shipGrid
      gridIndex = ship.y * Settings.gridCols + ship.x;
      for (j = 0; j < ship.size; j++) {
        this.shipGrid[gridIndex] = shipIndex;
        gridIndex += ship.horizontal ? 1 : Settings.gridCols;
      }
      return true;
    }
  }

  return false;
};

/**
 * Check if a ship overlaps another ship in the grid.
 * @param {Ship} ship
 * @returns {Boolean} True if ship overlaps
 */
Player.prototype.checkShipOverlap = function (ship) {
  var i,
    gridIndex = ship.y * Settings.gridCols + ship.x;

  for (i = 0; i < ship.size; i++) {
    if (this.shipGrid[gridIndex] >= 0) {
      return true;
    }
    gridIndex += ship.horizontal ? 1 : Settings.gridCols;
  }

  return false;
};

/**
 * Check if there are ships adjacent to this ship placement
 * @param {Ship} ship
 * @returns {Boolean} True if adjacent ship found
 */
Player.prototype.checkShipAdjacent = function (ship) {
  var i,
    j,
    x1 = ship.x - 1,
    y1 = ship.y - 1,
    x2 = ship.horizontal ? ship.x + ship.size : ship.x + 1,
    y2 = ship.horizontal ? ship.y + 1 : ship.y + ship.size;

  for (i = x1; i <= x2; i++) {
    if (i < 0 || i > Settings.gridCols - 1) continue;
    for (j = y1; j <= y2; j++) {
      if (j < 0 || j > Settings.gridRows - 1) continue;
      if (this.shipGrid[j * Settings.gridCols + i] >= 0) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Create ships and place them in grid in a prearranged layout
 */
Player.prototype.createShips = function () {
  var shipIndex,
    i,
    gridIndex,
    ship,
    x = [1, 3, 5, 8, 8],
    y = [1, 2, 5, 2, 8],
    horizontal = [false, true, false, false, true];

  for (shipIndex = 0; shipIndex < Settings.ships.length; shipIndex++) {
    ship = new Ship(Settings.ships[shipIndex]);
    ship.horizontal = horizontal[shipIndex];
    ship.x = x[shipIndex];
    ship.y = y[shipIndex];

    // place ship array-index in shipGrid
    gridIndex = ship.y * Settings.gridCols + ship.x;
    for (i = 0; i < ship.size; i++) {
      this.shipGrid[gridIndex] = shipIndex;
      gridIndex += ship.horizontal ? 1 : Settings.gridCols;
    }

    this.ships.push(ship);
  }
};

module.exports = Player;
