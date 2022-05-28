const actualWidth = 10000;
const actualHeight = 10000;

class blobData {
  constructor() {
    this.x = getRandomInt(-actualWidth / 2, actualWidth / 2);
    this.y = getRandomInt(-actualHeight / 2, actualHeight / 2);
    this.color = 'hsl(' + Math.floor(255 * Math.random()) + ',100%,50%)';
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  blobData,
  getRandomInt,
};
