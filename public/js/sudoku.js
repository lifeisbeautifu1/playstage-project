// Dark theme
const CONSTANT = {
  UNASSIGNED: 0,
  GRID_SIZE: 9,
  BOX_SIZE: 3,
  NUMBERS: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  LEVEL_NAME: ['Easy', 'Normal', 'Hard', 'Very hard'],
  LEVEL: [23, 38, 47, 67],
};

// Screens
const startScreen = document.querySelector('#start-screen');
const gameScreen = document.querySelector('#game-screen');
const pauseScreen = document.querySelector('#pause-screen');
const resultScreen = document.querySelector('#result-screen');

// Inputs
const nameInput = document.querySelector('#input-name');
const playerName = document.querySelector('#player-name');
const gameLevel = document.querySelector('#game-level');
const gameTime = document.querySelector('#game-time');
const numberInputs = document.querySelectorAll('.number');
const resultTime = document.querySelector('#result-time');
// Buttons
const playBtn = document.querySelector('#btn-play');
const levelBtn = document.querySelector('#btn-level');
const pauseBtn = document.querySelector('#btn-pause');
const continueBtn = document.querySelector('#btn-continue');
const resumeBtn = document.querySelector('#btn-resume');
const newGameBtn = document.querySelector('#btn-new-game');
const newGame2Btn = document.querySelector('#btn-new-game-2');
const deleteBtn = document.querySelector('#btn-delete');

const cells = document.querySelectorAll('.main-grid-cell');
const darkModeToggle = document.querySelector('#dark-mode-toggle');

let levelIndex = 0;
let level = CONSTANT.LEVEL[levelIndex];
let timer = null;
let pause = false;
let seconds = 0;
let su = undefined;
let su_answer = undefined;
let selectedCell = -1;

// Event listeners for clicks

levelBtn.addEventListener('click', (e) => {
  levelIndex = levelIndex + 1 > CONSTANT.LEVEL.length - 1 ? 0 : levelIndex + 1;
  // (!)
  level = CONSTANT.LEVEL[levelIndex];
  e.target.innerHTML = CONSTANT.LEVEL_NAME[levelIndex];
});

playBtn.addEventListener('click', () => {
  initSudoku();
  startGame();
});
continueBtn.addEventListener('click', () => {
  loadSudoku();
  startGame();
});

pauseBtn.addEventListener('click', (e) => {
  pause = true;
  gameScreen.classList.remove('active');
  pauseScreen.classList.add('active');
});

resumeBtn.addEventListener('click', (e) => {
  pause = false;
  gameScreen.classList.add('active');
  pauseScreen.classList.remove('active');
});

newGameBtn.addEventListener('click', (e) => {
  returnStartScreen();
});

newGame2Btn.addEventListener('click', (e) => {
  returnStartScreen();
});

deleteBtn.addEventListener('click', () => {
  cells[selectedCell].innerHTML = '';
  cells[selectedCell].setAttribute('data-value', 0);

  let row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
  let col = selectedCell % CONSTANT.GRID_SIZE;

  su_answer[row][col] = 0;

  removeErr();
});

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');

  const isDarkMode = document.body.classList.contains('dark');

  localStorage.setItem('darkmode', isDarkMode);
});

const initGameGrid = () => {
  for (let i = 0; i < 81; ++i) {
    let row = Math.floor(i / CONSTANT.GRID_SIZE);
    let col = i % CONSTANT.GRID_SIZE;
    if (row === 2 || row == 5) cells[i].style.marginBottom = '10px';
    if (col === 2 || col == 5) cells[i].style.marginRight = '10px';
  }
};

const showTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(11, 19);

const returnStartScreen = () => {
  clearInterval(timer);
  pause = false;
  seconds = 0;
  startScreen.classList.add('active');
  gameScreen.classList.remove('active');
  pauseScreen.classList.remove('active');
  resultScreen.classList.remove('active');
};

const newGrid = (size) => {
  let arr = new Array(size);

  for (let i = 0; i < size; ++i) arr[i] = new Array(size);

  for (let i = 0; i < size * size; ++i)
    arr[Math.floor(i / size)][i % size] = CONSTANT.UNASSIGNED;

  return arr;
};

// Check duplicate number in col
const isColSafe = (grid, col, value) => {
  for (let row = 0; row < CONSTANT.GRID_SIZE; ++row) {
    if (grid[row][col] === value) return false;
  }
  return true;
};

// Check duplicate number in row
const isRowSafe = (grid, row, value) => {
  for (let col = 0; col < CONSTANT.GRID_SIZE; ++col) {
    if (grid[row][col] === value) return false;
  }
  return true;
};

// Check duplicate in box 3x3
const isBoxSafe = (grid, box_row, box_col, value) => {
  for (let row = 0; row < CONSTANT.BOX_SIZE; ++row) {
    for (let col = 0; col < CONSTANT.BOX_SIZE; ++col) {
      if (grid[row + box_row][col + box_col] === value) return false;
    }
  }
  return true;
};

// check in row, col and box
const isSafe = (grid, row, col, value) => {
  return (
    isRowSafe(grid, row, value) &&
    isColSafe(grid, col, value) &&
    isBoxSafe(grid, row - (row % 3), col - (col % 3), value) &&
    value !== CONSTANT.UNASSIGNED
  );
};

// Find unassigned cell
const findUnassignedPos = (grid, pos) => {
  for (let row = 0; row < CONSTANT.GRID_SIZE; ++row) {
    for (let col = 0; col < CONSTANT.GRID_SIZE; ++col) {
      if (grid[row][col] === CONSTANT.UNASSIGNED) {
        pos.row = row;
        pos.col = col;
        return true;
      }
    }
  }
  return false;
};

// Shuffle array
const shuffleArray = (arr) => {
  let currIndex = arr.length;

  while (currIndex !== 0) {
    let randIndex = Math.floor(Math.random() * currIndex);
    currIndex -= 1;

    let tmp = arr[currIndex];
    arr[currIndex] = arr[randIndex];
    arr[randIndex] = tmp;
  }

  return arr;
};

// Check if puzzle is complete
const isFullGrid = (grid) => {
  return grid.every((row, i) => {
    return row.every((value, j) => {
      return value !== CONSTANT.UNASSIGNED;
    });
  });
};
let k = 0;

const SudokuCreate = (grid) => {
  let unassignedPos = {
    row: -1,
    col: -1,
  };
  if (!findUnassignedPos(grid, unassignedPos)) return true;
  let numberList = shuffleArray([...CONSTANT.NUMBERS]);

  let row = unassignedPos.row;
  let col = unassignedPos.col;

  numberList.forEach((num, i) => {
    if (isSafe(grid, row, col, num)) {
      grid[row][col] = num;
      if (isFullGrid(grid)) {
        return true;
      } else {
        if (SudokuCreate(grid)) {
          return true;
        }
      }
      grid[row][col] = CONSTANT.UNASSIGNED;
    }
  });

  return isFullGrid(grid);
};

const SudokuCheck = (grid) => {
  let unassignedPos = {
    row: -1,
    col: -1,
  };
  if (!findUnassignedPos(grid, unassignedPos)) return true;

  grid.forEach((row, i) => {
    row.forEach((num, j) => {
      if (isSafe(grid, i, j, num)) {
        if (isFullGrid(grid)) {
          return true;
        } else {
          if (SudokuCreate(grid)) {
            return true;
          }
        }
      }
    });
  });
  return isFullGrid(grid);
};

const rand = () => Math.floor(Math.random() * CONSTANT.GRID_SIZE);

const removeCells = (grid, level) => {
  let res = [...grid];
  let attemps = level;
  while (attemps > 0) {
    let row = rand();
    let col = rand();

    while (res[row][col] === 0) {
      row = rand();
      col = rand();
    }
    res[row][col] = CONSTANT.UNASSIGNED;
    attemps--;
  }
  return res;
};

const sudokuGen = (level) => {
  let sudoku = newGrid(CONSTANT.GRID_SIZE);
  let check = SudokuCreate(sudoku);
  if (check) {
    let question = removeCells(sudoku, level);
    return {
      original: sudoku,
      question: question,
    };
  }
  return undefined;
};

const clearSudoku = () => {
  for (let i = 0; i < 81; ++i) {
    cells[i].innerHTML = '';
    cells[i].classList.remove('filled');
    cells[i].classList.remove('err');
    cells[i].classList.remove('selected');
  }
};

const initSudoku = () => {
  clearSudoku();
  resetBg();
  su = sudokuGen(level);
  su_answer = [...su.question];
  // console.table([...su_answer]);

  seconds = 0;

  saveGameInfo();

  for (let i = 0; i < 81; ++i) {
    let row = Math.floor(i / CONSTANT.GRID_SIZE);
    let col = i % CONSTANT.GRID_SIZE;

    cells[i].setAttribute('data-value', su.question[row][col]);

    if (su.question[row][col] !== 0) {
      cells[i].classList.add('filled');
      cells[i].innerHTML = su.question[row][col];
    }
  }
};

const loadSudoku = () => {
  let game = getGameInfo();

  gameLevel.innerHTML = CONSTANT.LEVEL_NAME[game.level];

  su = game.su;

  su_answer = su.answer;

  seconds = game.seconds;

  gameTime.innerHTML = showTime(seconds);

  levelIndex = game.level;

  for (let i = 0; i < 81; ++i) {
    let row = Math.floor(i / CONSTANT.GRID_SIZE);
    let col = i % CONSTANT.GRID_SIZE;

    cells[i].setAttribute('data-value', su_answer[row][col]);
    cells[i].innerHTML = su_answer[row][col] !== 0 ? su_answer[row][col] : '';

    if (su.question[row][col] !== 0) {
      cells[i].classList.add('filled');
    }
  }
};

const hoverBg = (index) => {
  let row = Math.floor(index / CONSTANT.GRID_SIZE);
  let col = index % CONSTANT.GRID_SIZE;

  let box_start_row = row - (row % 3);
  let box_start_col = col - (col % 3);

  for (let i = 0; i < CONSTANT.BOX_SIZE; ++i) {
    for (let j = 0; j < CONSTANT.BOX_SIZE; ++j) {
      let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
      cell.classList.add('hover');
    }
  }

  let step = 9;
  while (index - step >= 0) {
    cells[index - step].classList.add('hover');
    step += 9;
  }

  step = 9;
  while (index + step < 81) {
    cells[index + step].classList.add('hover');
    step += 9;
  }

  step = 1;
  while (index - step >= 9 * row) {
    cells[index - step].classList.add('hover');
    step += 1;
  }

  step = 1;
  while (index + step < 9 * row + 9) {
    cells[index + step].classList.add('hover');
    step += 1;
  }
};

const resetBg = () => {
  cells.forEach((cell) => cell.classList.remove('hover'));
};

const checkErr = (value) => {
  const addErr = (cell) => {
    if (parseInt(cell.getAttribute('data-value')) === value) {
      cell.classList.add('err');
      cell.classList.add('cell-err');
      setTimeout(() => {
        cell.classList.remove('cell-err');
      }, 500);
    }
  };

  let index = selectedCell;

  let row = Math.floor(index / CONSTANT.GRID_SIZE);
  let col = index % CONSTANT.GRID_SIZE;

  let box_start_row = row - (row % 3);
  let box_start_col = col - (col % 3);

  for (let i = 0; i < CONSTANT.BOX_SIZE; ++i) {
    for (let j = 0; j < CONSTANT.BOX_SIZE; ++j) {
      let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
      if (!cell.classList.contains('selected')) addErr(cell);
    }
  }

  let step = 9;
  while (index - step >= 0) {
    addErr(cells[index - step]);
    step += 9;
  }

  step = 9;
  while (index + step < 81) {
    addErr(cells[index + step]);
    step += 9;
  }

  step = 1;
  while (index - step >= 9 * row) {
    addErr(cells[index - step]);
    step += 1;
  }

  step = 1;
  while (index + step < 9 * row + 9) {
    addErr(cells[index + step]);
    step += 1;
  }
};

const removeErr = () => {
  cells.forEach((cell) => cell.classList.remove('err'));
};

const saveGameInfo = () => {
  let game = {
    level: levelIndex,
    seconds: seconds,
    su: {
      original: su.original,
      question: su.question,
      answer: su_answer,
    },
  };

  localStorage.setItem('game', JSON.stringify(game));
};

const removeGameInfo = () => {
  localStorage.removeItem('game');
  continueBtn.style.display = 'none';
};

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

const isGameWin = () => SudokuCheck(su_answer);

const showResult = () => {
  clearInterval();
  resultScreen.classList.add('active');
  gameScreen.classList.remove('active');

  gameOver(CONSTANT.LEVEL_NAME[levelIndex]);

  resultTime.innerHTML = showTime(seconds);
};

async function gameOver(level) {
  let result = await fetch('/dashboard/sudoku/gameOver', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      level: level,
    }),
  }).then((res) => res.json());
}

const initNumberInputEvent = () => {
  numberInputs.forEach((e, index) => {
    e.addEventListener('click', () => {
      if (!cells[selectedCell].classList.contains('filled')) {
        cells[selectedCell].innerHTML = index + 1;
        cells[selectedCell].setAttribute('data-value', index + 1);

        let row = Math.floor(selectedCell / CONSTANT.GRID_SIZE);
        let col = selectedCell % CONSTANT.GRID_SIZE;
        su_answer[row][col] = index + 1;

        saveGameInfo();

        removeErr();
        checkErr(index + 1);
        cells[selectedCell].classList.add('zoom-in');
        setTimeout(() => {
          cells[selectedCell].classList.remove('zoom-in');
        }, 500);

        if (isGameWin()) {
          removeGameInfo();
          showResult();
        }
      }
    });
  });
};

initCellEvent = () => {
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
      if (!cell.classList.contains('filled')) {
        cells.forEach((c) => c.classList.remove('selected'));

        selectedCell = index;
        cell.classList.remove('err');
        cell.classList.add('selected');
        resetBg();
        hoverBg(index);
      }
    });
  });
};

const startGame = () => {
  startScreen.classList.remove('active');
  gameScreen.classList.add('active');

  gameLevel.innerHTML = CONSTANT.LEVEL_NAME[levelIndex];

  seconds = 0;
  showTime(seconds);

  timer = setInterval(() => {
    if (!pause) {
      seconds += 1;
      gameTime.innerHTML = showTime(seconds);
    }
  }, 1000);
};

const init = () => {
  const darkmode = JSON.parse(localStorage.getItem('darkmode'));
  if (darkmode) document.body.classList.add('dark');

  const game = JSON.parse(localStorage.getItem('game'));

  document.querySelector('#btn-continue').style.display = game
    ? 'grid'
    : 'none';

  initGameGrid();
  initCellEvent();
  initNumberInputEvent();
};

init();
