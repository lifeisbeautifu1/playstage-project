class BlobBody {
  constructor(x, y, a) {
    this.color = `hsl(${Math.floor(Math.random() * 255)}, 100%, 50%)`;
    this.pos = {
      x: x,
      y: y,
    };
    this.area = a;
    this.originalArea = this.area;
    this.r = Math.sqrt(this.area / Math.PI) * 40;
    this.originalR = this.r;
  }

  show(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }

  inWindow(px, py, cw, ch) {
    return (
      this.pos.x >= px - cw / 2 &&
      this.pos.x <= px + cw / 2 &&
      this.pos.y >= py - ch / 2 &&
      this.pos.y <= py + ch / 2
    );
  }
}
