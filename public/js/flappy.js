let modal = document.getElementById('my-modal');
let btn = document.getElementById('modal-btn');
btn.addEventListener('click', toPlayAgain);

let text = document.getElementById('text');

let cvs = document.getElementById('canvas');
let ctx = cvs.getContext('2d');

let bird = new Image();
let bg = new Image();
let fg = new Image();
let pipeUp = new Image();
let pipeBottom = new Image();

bird.src = '/public/img/bird.png';
bg.src = '/public/img/bg.png';
fg.src = '/public/img/fg.png';
pipeUp.src = '/public/img/pipeUp.png';
pipeBottom.src = '/public/img/pipeBottom.png';

let gap = 100;

function touchEvent(e) {
  e.preventDefault();
  moveUp();
}

document.addEventListener('keydown', moveUp);
document.addEventListener('click', moveUp);
document.addEventListener('touchstart', touchEvent, { passive: false });

function moveUp() {
  yPos -= 25;
}

// Создание блоков
let pipe = [];

pipe[0] = {
  x: cvs.width - 100,
  y: 0,
};

let score = 0;

// Позиция птички
let xPos = 10;
let yPos = 150;
let grav = 1.5;

function draw() {
  ctx.drawImage(bg, 0, 0);

  for (let i = 0; i < pipe.length; i++) {
    ctx.drawImage(pipeUp, pipe[i].x, pipe[i].y);

    ctx.drawImage(pipeBottom, pipe[i].x, pipe[i].y + pipeUp.height + gap);

    pipe[i].x--;

    if (pipe[i].x == 130) {
      pipe.push({
        x: cvs.width,

        y: Math.floor(Math.random() * pipeUp.height) - pipeUp.height,
      });
    }

    // Отслеживание прикосновений
    if (
      (xPos + bird.width >= pipe[i].x &&
        xPos <= pipe[i].x + pipeUp.width &&
        (yPos <= pipe[i].y + pipeUp.height ||
          yPos + bird.height >= pipe[i].y + pipeUp.height + gap)) ||
      yPos + bird.height >= cvs.height - fg.height
    ) {
      clearInterval(game);

      modal.style.display = 'block';

      text.textContent = 'You score: ' + score;

      document.removeEventListener('touchstart', touchEvent);

      gameOver(score);
    }

    if (pipe[i].x == 5) {
      score++;
    }
  }

  ctx.drawImage(fg, 0, cvs.height - fg.height);
  ctx.drawImage(bird, xPos, yPos);

  yPos += grav;

  ctx.fillStyle = '#000';
  ctx.font = '24px Verdana';
  ctx.fillText('Score: ' + score, 10, cvs.height - 20);
}

function toPlayAgain() {
  location.reload();
}

pipeBottom.onload = draw;

game = setInterval(draw, 30);

async function gameOver(score) {
  let result = await fetch('/dashboard/flappy/gameOver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      score: score,
    }),
  }).then((res) => res.json());
}
