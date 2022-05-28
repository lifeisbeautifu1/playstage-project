class Player extends BlobBody {
  constructor(x, y, a, id, name) {
    super(x, y, a);

    this.id = id;

    this.name = name;
  }
  show(ctx) {
    ctx.beginPath();
    this.r = Math.sqrt(this.area / Math.PI) * 40;
    ctx.fillStyle = this.color;
    ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
    const scale = this.r / this.originalR;
    const fontSize = 20 * scale;
    ctx.font = `${fontSize}px Helvetica`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';

    ctx.textBaseline = 'middle';
    ctx.fillText(this.name, this.pos.x, this.pos.y);
  }

  setData(data) {
    this.pos.x = data.pos.x;
    this.pos.y = data.pos.y;
    this.area = data.m;
    this.color = data.color;
    this.id = data.id;
    this.name = data.name;
  }
}
