const canvas = document.getElementById('game');

const ctx = canvas.getContext('2d');

const ground = new Image();

const playAgainBtn = document.querySelector('.play-again');

playAgainBtn.addEventListener('click', (e) => {
  e.preventDefault();
  modal.classList.toggle('hidden');
  lose();
});

document.addEventListener('DOMContentLoaded', (e) => {
  if (this.visualViewport.width < 768) {
    document.querySelector('.controls').classList.remove('hidden');
  }
});

const modal = document.querySelector('.modal');

const scoreSpan = document.querySelector('.score');

ground.src = '/public/img/ground.png';

const foodImg = new Image();

foodImg.src = '/public/img/food.png';

// Audio

const eatSound = new Audio();

eatSound.src = '/public/audio/eat.mp3';

const deadSound = new Audio();

deadSound.src = '/public/audio/dead.mp3';

const upSound = new Audio();

upSound.src = '/public/audio/up.mp3';

const downSound = new Audio();

downSound.src = '/public/audio/down.mp3';

const leftSound = new Audio();

leftSound.src = '/public/audio/left.mp3';

const rightSound = new Audio();

rightSound.src = '/public/audio/right.mp3';

let box = 32;

let score = 0;

let food = {
  x: Math.floor(Math.random() * 17 + 1) * box,

  y: Math.floor(Math.random() * 15 + 3) * box,
};

let snake = [];

snake[0] = {
  x: 9 * box,

  y: 10 * box,
};

document.addEventListener('keydown', direction);

let dir;

function direction(event) {
  if (event.keyCode == 37 && dir != 'right') {
    leftSound.play();
    dir = 'left';
  } else if (event.keyCode == 38 && dir != 'down') {
    upSound.play();
    dir = 'up';
  } else if (event.keyCode == 39 && dir != 'left') {
    rightSound.play();
    dir = 'right';
  } else if (event.keyCode == 40 && dir != 'up') {
    downSound.play();
    dir = 'down';
  }
}

const up = document.querySelector('.up'),
  left = document.querySelector('.left'),
  right = document.querySelector('.right'),
  down = document.querySelector('.down');

up.addEventListener('click', (e) => {
  if (dir != 'down') {
    upSound.play();
    dir = 'up';
  }
});
down.addEventListener('click', (e) => {
  if (dir != 'up') {
    downSound.play();
    dir = 'down';
  }
});
left.addEventListener('click', (e) => {
  if (dir != 'right') {
    leftSound.play();
    dir = 'left';
  }
});
right.addEventListener('click', (e) => {
  if (dir != 'left') {
    rightSound.play();
    dir = 'right';
  }
});

function eatTail(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x == arr[i].x && head.y == arr[i].y) {
      deadSound.play();
      clearInterval(game);
      scoreSpan.innerHTML = score;
      modal.classList.toggle('hidden');
      gameOver(score);
    }
  }
}

function drawGame() {
  ctx.drawImage(ground, 0, 0);

  ctx.drawImage(foodImg, food.x, food.y);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? 'green' : 'red';

    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = 'white';

  ctx.font = '50px Arial';

  ctx.fillText(score, box * 2.5, box * 1.7);

  let snakeX = snake[0].x;

  let snakeY = snake[0].y;

  if (snakeX == food.x && snakeY == food.y) {
    score++;

    eatSound.play();
    food = {
      x: Math.floor(Math.random() * 17 + 1) * box,

      y: Math.floor(Math.random() * 15 + 3) * box,
    };
  } else {
    snake.pop();
  }

  if (
    snakeX < box ||
    snakeX > box * 17 ||
    snakeY < 3 * box ||
    snakeY > box * 17
  ) {
    clearInterval(game);
    scoreSpan.innerHTML = score;
    modal.classList.toggle('hidden');
    gameOver(score);
    deadSound.play();
  }

  if (dir == 'left') {
    snakeX -= box;
  }

  if (dir == 'right') {
    snakeX += box;
  }

  if (dir == 'up') {
    snakeY -= box;
  }

  if (dir == 'down') {
    snakeY += box;
  }

  let newHead = {
    x: snakeX,

    y: snakeY,
  };

  eatTail(newHead, snake);

  snake.unshift(newHead);
}

function lose() {
  while (snake.length != 1) {
    snake.pop();
  }

  snake[0].x = 9 * box;
  snake[0].y = 10 * box;

  food.x = Math.floor(Math.random() * 17 + 1) * box;
  food.y = Math.floor(Math.random() * 15 + 3) * box;

  score = 0;

  dir = 0;

  game = setInterval(drawGame, 125);
}

let game = setInterval(drawGame, 125);

async function gameOver(score) {
  let result = await fetch('/dashboard/snake/gameOver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      score: score,
    }),
  }).then((res) => res.json());
}
