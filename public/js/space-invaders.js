const grid = document.querySelector('.grid');
let currentShooterIndex = 202;
let width = 15;
let direction = 1;
let invadersId;
let goingRight = true;
let aliensRemoved = [];
let results = 0;
let level = 0;
let playMusic = true;

const fireSound = new Audio('/public/audio/lazer2.mp3');
const crash = new Audio('/public/audio/gameover.mp3');
const spaceShipSound = new Audio('/public/audio/thriller.mp3');

let modal = document.getElementById('my-modal');
let btn = document.getElementById('modal-btn');
btn.addEventListener('click', toPlayAgain);
let text = document.getElementById('text');
let textResult = document.getElementById('gameResult');
const score = document.querySelector('.score');

for (let i = 0; i < 225; i++) {
  const square = document.createElement('div');
  grid.appendChild(square);
}

const squares = Array.from(document.querySelectorAll('.grid div'));

let alienInvaders = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30, 31,
  32, 33, 34, 35, 36, 37, 38, 39,
];

function draw() {
  score.textContent = `Score: ${results}`;
  for (let i = 0; i < alienInvaders.length; i++) {
    if (!aliensRemoved.includes(i)) {
      squares[alienInvaders[i]].classList.add('invader');
      if (i < 10) {
        squares[alienInvaders[i]].classList.add('first');
      } else if (i < 20) {
        squares[alienInvaders[i]].classList.add('second');
      } else {
        squares[alienInvaders[i]].classList.add('third');
      }
    }
  }
}

draw();

function remove() {
  for (let i = 0; i < alienInvaders.length; i++) {
    squares[alienInvaders[i]].classList.remove('invader');
    squares[alienInvaders[i]].classList.remove('first');
    squares[alienInvaders[i]].classList.remove('second');
    squares[alienInvaders[i]].classList.remove('third');
  }
}

squares[currentShooterIndex].classList.add('shooter');

function moveShooter(e) {
  if (playMusic) {
    spaceShipSound.play();
    spaceShipSound.loop = true;
    playMusic = false;
  }
  squares[currentShooterIndex].classList.remove('shooter');
  switch (e.key) {
    case 'ArrowLeft':
      if (currentShooterIndex % width !== 0) currentShooterIndex -= 1;
      break;
    case 'ArrowRight':
      if (currentShooterIndex % width < width - 1) currentShooterIndex += 1;
      break;
  }
  squares[currentShooterIndex].classList.add('shooter');
}
document.addEventListener('keydown', moveShooter);

function moveInvaders() {
  const leftEdge = alienInvaders[0] % width === 0;
  const rightEdge =
    alienInvaders[alienInvaders.length - 1] % width === width - 1;
  remove();

  if (rightEdge && goingRight) {
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] += width + 1;
      direction = -1;
      goingRight = false;
    }
  }

  if (leftEdge && !goingRight) {
    for (let i = 0; i < alienInvaders.length; i++) {
      alienInvaders[i] += width - 1;
      direction = 1;
      goingRight = true;
    }
  }

  for (let i = 0; i < alienInvaders.length; i++) {
    alienInvaders[i] += direction;
  }

  draw();

  if (squares[currentShooterIndex].classList.contains('invader', 'shooter')) {
    // spaceShipSound.pause();
    crash.play();
    modal.style.display = 'block';
    textResult.textContent = 'Game Over';
    btn.textContent = 'Play again';
    text.textContent = 'You score: ' + results;
    level = 0;
    results = 0;
    document.removeEventListener('keydown', shoot);
    document.removeEventListener('keydown', moveShooter);
    clearInterval(invadersId);
  }

  for (let i = 0; i < alienInvaders.length; i++) {
    if (alienInvaders[i] > squares.length) {
      // spaceShipSound.pause();
      crash.play();
      modal.style.display = 'block';
      textResult.textContent = 'Game Over';
      btn.textContent = 'Next Level';
      text.textContent = 'You score: ' + results;
      level = 0;
      results = 0;
      clearInterval(invadersId);
      document.removeEventListener('keydown', shoot);
      document.removeEventListener('keydown', moveShooter);
    }
  }
  if (aliensRemoved.length === alienInvaders.length) {
    // spaceShipSound.pause();
    modal.style.display = 'block';
    textResult.textContent = 'You win!';
    btn.textContent = 'Next Level';
    text.textContent = 'You score: ' + results;
    level++;
    clearInterval(invadersId);
    document.removeEventListener('keydown', shoot);
    document.removeEventListener('keydown', moveShooter);
  }
}
invadersId = setInterval(moveInvaders, 600);

function shoot(e) {
  if (playMusic) {
    spaceShipSound.play();
    spaceShipSound.loop = true;
    playMusic = false;
  }
  let laserId;
  let currentLaserIndex = currentShooterIndex;
  function moveLaser() {
    squares[currentLaserIndex].classList.remove('laser');
    currentLaserIndex -= width;
    if (currentLaserIndex < 0) {
      clearInterval(laserId);
      return;
    }
    squares[currentLaserIndex].classList.add('laser');

    if (squares[currentLaserIndex].classList.contains('invader')) {
      squares[currentLaserIndex].classList.remove('laser');
      squares[currentLaserIndex].classList.remove('invader');
      squares[currentLaserIndex].classList.add('boom');

      setTimeout(
        () => squares[currentLaserIndex].classList.remove('boom'),
        300
      );
      clearInterval(laserId);

      const alienRemoved = alienInvaders.indexOf(currentLaserIndex);
      aliensRemoved.push(alienRemoved);
      results++;
      // resultsDisplay.innerHTML = results;
      // console.log(aliensRemoved);
    }
  }
  switch (e.key) {
    case 'ArrowUp':
      laserId = setInterval(moveLaser, 100);

      fireSound.play();
    // fireSound.loop = true;
  }
}

function toPlayAgain() {
  remove();
  squares[currentShooterIndex].classList.remove('shooter');
  currentShooterIndex = 202;
  squares[currentShooterIndex].classList.add('shooter');
  alienInvaders = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39,
  ];
  aliensRemoved = [];
  draw();
  modal.style.display = 'none';
  invadersId = setInterval(moveInvaders, 600 - level * 25);
  document.addEventListener('keydown', shoot);
  document.addEventListener('keydown', moveShooter);
  //location.reload();
}

document.addEventListener('keydown', shoot);
