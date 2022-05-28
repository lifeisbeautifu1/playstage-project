class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.Mag = Math.sqrt(x * x + y * y);
  }
  normalize() {
    this.x /= this.Mag;
    this.y /= this.Mag;
    this.Mag = 0; // (!)
  }
  setMag(m) {
    this.normalize();
    this.x *= m;
    this.y *= m;
    this.Mag = m;
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.Mag = Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set(x, y) {
    this.x = x;
    this.y = y;
    this.Mag = Math.sqrt(x * x + y * y);
  }

  limitX(min, max) {
    this.x = Math.min(Math.max(parseInt(this.x), min), max);
  }

  limitY(min, max) {
    this.y = Math.min(Math.max(parseInt(this.y), min), max);
  }
}

module.exports = Vector;
