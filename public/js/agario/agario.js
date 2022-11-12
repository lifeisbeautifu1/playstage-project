const canvas = document.getElementById('game');

const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const actualWidth = 10000;
const actualHeight = 10000;

let blobs = [];

let player = new Player(0, 0, 5, 0, 'a');

let map = new Map(0, 0, 200, 200);

let otherPlayers = [];

let leaderboard = [];

let mouseX = null;
let mouseY = null;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener('click', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

window.addEventListener('touchstart', (e) => {
  mouseX = e.touches[0].clientX;
  mouseY = e.touches[0].clientY;
});

let socket = io();

let startDiv = document.getElementById('start');
let button = document.getElementById('startbtn');

button.addEventListener('click', async () => {
  const res = await fetch('/dashboard/data/me');
  const user = await res.json();
  socket.emit('init', {
    name: user.user.name,
    canvas: {
      w: canvas.width,
      h: canvas.height,
    },
  });

  startDiv.style.display = 'none';

  setInterval(main, 50);
});

socket.on('playerData', (data) => {
  player.setData(data);
});

socket.on('Players', (data) => {
  otherPlayers = [];
  data.forEach((data) => {
    if (data.id !== player.id) {
      let newPlayer = new Player(
        data.pos.x,
        data.pos.y,
        data.m,
        data.id,
        data.name
      );
      newPlayer.color = data.color;
      newPlayer.originalR = data.originalR;
      otherPlayers.push(newPlayer);
    }
  });
});

socket.on('blobData', (data) => {
  blobs = [];
  data.forEach((data) => {
    let b = new BlobBody(data.x, data.y, 1);
    b.color = data.color;
    blobs.push(b);
  });
});

socket.on('leaderboardData', (data) => {
  leaderboard = data;
});

function main() {
  ctx.fillStyle = 'white';
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fill();

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(player.originalR / player.r, player.originalR / player.r);
  ctx.translate(-player.pos.x, -player.pos.y);

  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.strokeRect(
    -actualWidth / 2,
    -actualHeight / 2,
    actualWidth,
    actualHeight
  );
  ctx.stroke();
  ctx.closePath();

  blobs.forEach((blob) => {
    if (
      blob.inWindow(
        player.pos.x,
        player.pos.y,
        canvas.width * (player.r / player.originalR),
        canvas.height * (player.r / player.originalR)
      )
    )
      blob.show(ctx);
  });

  otherPlayers.forEach((player) => player.show(ctx));

  player.show(ctx);
  ctx.textAlign = 'start';

  ctx.textBaseline = 'alphabetic';

  ctx.setTransform(1, 0, 0, 1, 0, 0);

  map.show(
    ctx,
    player.pos.x,
    player.pos.y,
    player.r,
    actualWidth,
    actualHeight
  );

  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';

  ctx.rect(canvas.width - 270, 0, 250, 400);

  ctx.fill();

  ctx.fillStyle = 'black';
  ctx.font = 'bold 30px Comic Sans';
  ctx.fillText(`Area: ${Math.floor(player.area)}`, 30, canvas.height - 40);

  ctx.fillStyle = 'white';

  ctx.fillText('Leaderboard', canvas.width - 230, 30);

  ctx.font = 'bold 20px Comic Sans';
  ctx.textAlign = 'start';
  for (let i = 0; i < leaderboard.length; i++) {
    ctx.fillText(
      i + 1 + '. ' + leaderboard[i].name + ': ' + leaderboard[i].score,
      canvas.width - 260,
      70 + i * 30
    );
  }

  socket.emit('mouseData', {
    mX: mouseX,
    mY: mouseY,
  });
}
