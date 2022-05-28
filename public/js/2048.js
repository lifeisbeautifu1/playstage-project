document.addEventListener('DOMContentLoaded', () => {
  const gridDisplay = document.querySelector('.grid');
  const scoreDisplay = document.querySelector('.score');
  const resultDisplay = document.querySelector('.result');

  const width = 4;
  let squares = [];
  let score = 0;
  let gameState;
  function createBoard() {
    for (let i = 0; i < width * width; i++) {
      let square = document.createElement('div');
      square.textContent = '0';
      squares.push(square);
      gridDisplay.appendChild(square);
    }
    generate();
    generate();
    changeColors();
  }

  createBoard();

  if (localStorage.getItem('score')) {
    score = parseInt(localStorage.getItem('score'));
  } else {
    localStorage.setItem('score', 0);
  }

  if (localStorage.getItem('gameState')) {
    gameState = JSON.parse(localStorage.getItem('gameState'));
  } else {
    localStorage.setItem(
      'gameState',
      JSON.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    );
    gameState = [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0];
  }

  setGame(gameState);

  function setGame(gs) {
    squares.forEach((square, index) => {
      square.textContent = gs[index];
    });
    changeColors();
    scoreDisplay.textContent = score;
  }

  function saveGame() {
    squares.forEach((square, index) => {
      gameState[index] = square.textContent;
    });
    localStorage.setItem('gameState', JSON.stringify(gameState));
    localStorage.setItem('score', score);
  }

  function generate() {
    const randomNumber = Math.floor(Math.random() * squares.length);
    if (squares[randomNumber].textContent == 0) {
      squares[randomNumber].textContent = 2;
      checkForGameOver();
    } else generate();
  }

  function moveRight() {
    for (let i = 0; i < width * width; i++) {
      if (i % 4 === 0) {
        let totalOne = squares[i].textContent;
        let totalTwo = squares[i + 1].textContent;
        let totalThree = squares[i + 2].textContent;
        let totalFour = squares[i + 3].textContent;
        let row = [
          parseInt(totalOne),
          parseInt(totalTwo),
          parseInt(totalThree),
          parseInt(totalFour),
        ];

        let filteredRow = row.filter((num) => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = zeros.concat(filteredRow);

        squares[i].textContent = newRow[0];
        squares[i + 1].textContent = newRow[1];
        squares[i + 2].textContent = newRow[2];
        squares[i + 3].textContent = newRow[3];
      }
    }
  }
  function moveLeft() {
    for (let i = 0; i < width * width; i++) {
      if (i % 4 === 0) {
        let totalOne = squares[i].textContent;
        let totalTwo = squares[i + 1].textContent;
        let totalThree = squares[i + 2].textContent;
        let totalFour = squares[i + 3].textContent;
        let row = [
          parseInt(totalOne),
          parseInt(totalTwo),
          parseInt(totalThree),
          parseInt(totalFour),
        ];

        let filteredRow = row.filter((num) => num);
        let missing = 4 - filteredRow.length;
        let zeros = Array(missing).fill(0);
        let newRow = filteredRow.concat(zeros);

        squares[i].textContent = newRow[0];
        squares[i + 1].textContent = newRow[1];
        squares[i + 2].textContent = newRow[2];
        squares[i + 3].textContent = newRow[3];
      }
    }
  }

  function moveDown() {
    for (let i = 0; i < 4; i++) {
      let totalOne = squares[i].textContent;
      let totalTwo = squares[i + width].textContent;
      let totalThree = squares[i + width * 2].textContent;
      let totalFour = squares[i + width * 3].textContent;
      let column = [
        parseInt(totalOne),
        parseInt(totalTwo),
        parseInt(totalThree),
        parseInt(totalFour),
      ];

      let filteredColumn = column.filter((num) => num);
      let missing = 4 - filteredColumn.length;
      let zeros = Array(missing).fill(0);
      let newColumn = zeros.concat(filteredColumn);

      squares[i].textContent = newColumn[0];
      squares[i + width].textContent = newColumn[1];
      squares[i + width * 2].textContent = newColumn[2];
      squares[i + width * 3].textContent = newColumn[3];
    }
  }
  function moveUp() {
    for (let i = 0; i < 4; i++) {
      let totalOne = squares[i].textContent;
      let totalTwo = squares[i + width].textContent;
      let totalThree = squares[i + width * 2].textContent;
      let totalFour = squares[i + width * 3].textContent;
      let column = [
        parseInt(totalOne),
        parseInt(totalTwo),
        parseInt(totalThree),
        parseInt(totalFour),
      ];

      let filteredColumn = column.filter((num) => num);
      let missing = 4 - filteredColumn.length;
      let zeros = Array(missing).fill(0);
      let newColumn = filteredColumn.concat(zeros);

      squares[i].textContent = newColumn[0];
      squares[i + width].textContent = newColumn[1];
      squares[i + width * 2].textContent = newColumn[2];
      squares[i + width * 3].textContent = newColumn[3];
    }
  }

  function combineRow() {
    for (let i = 0; i < 15; i++) {
      if (squares[i].textContent === squares[i + 1].textContent) {
        let combineTotal =
          parseInt(squares[i].textContent) +
          parseInt(squares[i + 1].textContent);
        squares[i].textContent = combineTotal;
        squares[i + 1].textContent = 0;
        score += combineTotal;
        scoreDisplay.textContent = score;
      }
    }
    checkForWin();
  }
  function combineColumn() {
    for (let i = 0; i < 12; i++) {
      if (squares[i].textContent === squares[i + width].textContent) {
        let combineTotal =
          parseInt(squares[i].textContent) +
          parseInt(squares[i + width].textContent);
        squares[i].textContent = combineTotal;
        squares[i + width].textContent = 0;
        score += combineTotal;
        scoreDisplay.textContent = score;
      }
    }
    checkForWin();
  }

  function control(e) {
    if (e.keyCode === 39) {
      keyRight();
    } else if (e.keyCode == 37) {
      keyLeft();
    } else if (e.keyCode == 38) {
      keyUp();
    } else if (e.keyCode == 40) {
      keyDown();
    }
  }
  document.addEventListener('keyup', control);

  function keyRight() {
    moveRight();
    combineRow();
    moveRight();
    generate();
    changeColors();
    saveGame();
  }
  function keyLeft() {
    moveLeft();
    combineRow();
    moveLeft();
    generate();
    changeColors();
    saveGame();
  }
  function keyDown() {
    moveDown();
    combineColumn();
    moveDown();
    generate();
    changeColors();
    saveGame();
  }
  function keyUp() {
    moveUp();
    combineColumn();
    moveUp();
    generate();
    changeColors();
    saveGame();
  }

  function checkForWin() {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].textContent == 2048) {
        title.textContent = 'You Won!';
        scoreInModal.textContent = `Score: ${score}`;
        modal.classList.toggle('hidden');
        document.removeEventListener('keyup', control);
        gameOver('win', score);
      }
    }
  }

  function checkForGameOver() {
    let zeros = 0;
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].textContent == 0) zeros++;
    }
    if (zeros === 0) {
      title.textContent = 'You Lost!';
      scoreInModal.textContent = `Score: ${score}`;
      modal.classList.toggle('hidden');
      document.removeEventListener('keyup', control);
      gameOver('lose', score);
    }
  }

  function changeColors() {
    squares.forEach((square) => {
      switch (square.textContent) {
        case '0':
          square.className = '';
          square.classList.add('empty');
          break;
        case '2':
          square.className = '';
          square.classList.add('two');
          break;
        case '4':
          square.className = '';
          square.classList.add('four');
          break;
        case '8':
          square.className = '';
          square.classList.add('eight');
          break;
        case '16':
          square.className = '';
          square.classList.add('sixteen');
          break;
        case '32':
          square.className = '';
          square.classList.add('thirtytwo');
          break;
        case '64':
          square.className = '';
          square.classList.add('sixtyfour');
          break;
        case '128':
          square.className = '';
          square.classList.add('twentyeight');
          break;
        case '256':
          square.className = '';
          square.classList.add('fiftysix');
          break;
        case '512':
          square.className = '';
          square.classList.add('twelwe');
          break;
        case '1024':
          square.className = '';
          square.classList.add('twentyfour');
          break;
        case '2048':
          square.className = '';
          square.classList.add('fourtyeight');
          break;
      }
    });
  }

  const modal = document.querySelector('.modal');
  const title = document.querySelector('.title');
  const scoreInModal = document.querySelector('.score-modal');

  const again = document.querySelector('.play-again');
  const back = document.querySelector('.back');

  again.addEventListener('click', () => {
    score = 0;
    setGame([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    generate();
    generate();
    changeColors();
    saveGame();
    modal.classList.toggle('hidden');
    document.addEventListener('keyup', control);
  });
  back.addEventListener('click', (e) => {
    e.preventDefault();
    score = 0;
    setGame([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    generate();
    generate();
    changeColors();
    saveGame();
    document.addEventListener('keyup', control);
    window.location.href = '/dashboard';
  });

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchmove', handleTouchMove, false);

  var xDown = null;
  var yDown = null;

  function func() {
    console.log(123);
  }

  function getTouches(evt) {
    return (
      evt.touches || // browser API
      evt.originalEvent.touches
    ); // jQuery
  }

  function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(evt) {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /*most significant*/
      if (xDiff > 0) {
        keyLeft();
      } else {
        keyRight();
      }
    } else {
      if (yDiff > 0) {
        keyUp();
      } else {
        keyDown();
      }
    }
    /* reset values */
    xDown = null;
    yDown = null;
  }
});

async function gameOver(status, score) {
  let result = await fetch('/dashboard/2048/gameover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: status,
      score: score,
    }),
  }).then((res) => res.json());
}
