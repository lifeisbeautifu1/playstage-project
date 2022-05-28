const soundDot = new Audio('/public/audio/munch.wav'),
  soundPill = new Audio('/public/audio/pill.wav'),
  soundGameStart = new Audio('/public/audio/game_start.wav'),
  soundGameOver = new Audio('/public/audio/death.wav'),
  soundGhost = new Audio('/public/audio/eat_ghost.wav');

const gameGrid = document.querySelector('#game'),
  scoreTable = document.querySelector('#score'),
  startButton = document.querySelector('#start-button'),
  mobileControls = document.querySelector('.mobile-control'),
  arrowUp = document.querySelector('.up'),
  arrowDown = document.querySelector('.down'),
  arrowLeft = document.querySelector('.left'),
  arrowRight = document.querySelector('.right');

const POWER_PILL_TIME = 10000,
  GLOBAL_SPEED = 70,
  gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

let score = 0,
  timer = null,
  gameWin = false,
  powerPillActive = false,
  powerPillTimer = null,
  latestScore = 0;

// function playAudio(audio) {
//   const soundEffect = new Audio(audio);
//   soundEffect.play();
// }

function gameOver(pacmman, grid) {
  soundGameOver.play();
  if (!gameWin) {
    document.removeEventListener('keydown', (e) => {
      pacman.handleKeyInput(e, gameBoard.objectExist);
    });
    gameBoard.showGameStatus(gameWin);
    clearInterval(timer);
    latestScore = 0;

    startButton.classList.remove('hide');
    mobileControls.classList.add('hide');
  } else {
    latestScore += score;
    document.removeEventListener('keydown', (e) => {
      pacman.handleKeyInput(e, gameBoard.objectExist);
    });
    clearInterval(timer);
    setTimeout(startGame, 2000);
  }
}

function checkCollision(pacman, ghosts) {
  const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);
  if (collidedGhost) {
    if (pacman.powerPill) {
      soundGhost.play();
      gameBoard.removeObject(collidedGhost.pos, [
        OBJECT_TYPE.GHOST,
        OBJECT_TYPE.SCARED,
        collidedGhost.name,
      ]);
      collidedGhost.pos = collidedGhost.startPos;
      score += 100;
    } else {
      gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
      gameBoard.rotateDiv(pacman.pos, 0);
      gameOver(pacman, gameGrid);
    }
  }
}

function gameLoop(pacman, ghosts) {
  gameBoard.moveCharacter(pacman);
  checkCollision(pacman, ghosts);

  ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
  checkCollision(pacman, ghosts);

  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
    soundDot.play();
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
    gameBoard.dotCount--;
    score += 10;
  }

  if (
    gameBoard.objectExist(pacman.pos, OBJECT_TYPE.TELEPORT_RIGHT) &&
    pacman.dir.movement === -1
  ) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
    pacman.pos = 240;
  } else if (
    gameBoard.objectExist(pacman.pos, OBJECT_TYPE.TELEPORT_LEFT) &&
    pacman.dir.movement === 1
  ) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
    pacman.pos = 219;
  }

  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
    soundPill.play();

    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);
    pacman.powerPill = true;
    score += 50;
    clearTimeout(powerPillTimer);
    powerPillTimer = setTimeout(
      () => (pacman.powerPill = false),
      POWER_PILL_TIME
    );
  }

  if (pacman.powerPill !== powerPillActive) {
    powerPillActive = pacman.powerPill;
    ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
  }

  if (gameBoard.dotCount === 0) {
    gameWin = true;
    gameOver(pacman, ghosts);
  }

  scoreTable.innerHTML = score;
}
let mobileScreen = false;
document.addEventListener('DOMContentLoaded', (e) => {
  if (window.outerWidth < 508) {
    mobileScreen = true;
  }
});

function startGame() {
  soundGameStart.play();
  gameWin = false;
  powerPillActive = false;
  score = latestScore;

  startButton.classList.add('hide');

  if (mobileScreen) mobileControls.classList.remove('hide');

  gameBoard.createGrid(LEVEL);
  const pacman = new Pacman(2, 287);
  gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
  document.addEventListener('keydown', (e) => {
    pacman.handleKeyInput(e, gameBoard.objectExist);
  });
  arrowUp.addEventListener('click', () => {
    pacman.handleClickInput('ArrowUp', gameBoard.objectExist);
  });
  arrowDown.addEventListener('click', () => {
    pacman.handleClickInput('ArrowDown', gameBoard.objectExist);
  });
  arrowLeft.addEventListener('click', () => {
    pacman.handleClickInput('ArrowLeft', gameBoard.objectExist);
  });
  arrowRight.addEventListener('click', () => {
    pacman.handleClickInput('ArrowRight', gameBoard.objectExist);
  });

  const ghosts = [
    new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE),
  ];

  timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

startButton.addEventListener('click', startGame);
