const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  about: {
    type: String,
    default: 'About info here...',
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  filename: {
    type: String,
    default: '',
  },
  messagesSend: {
    type: Number,
    default: 0,
  },
  messages: {
    wordle: {
      type: Array,
      default: [],
    },
    number: {
      type: Array,
      default: [],
    },
    snake: {
      type: Array,
      default: [],
    },
    flappy: {
      type: Array,
      default: [],
    },
    minesweeper: {
      type: Array,
      default: [],
    },
    doodle: {
      type: Array,
      default: [],
    },
    sudoku: {
      type: Array,
      default: [],
    },
    platformer: {
      type: Array,
      default: [],
    },
    speed: {
      type: Array,
      default: [],
    },
    frogger: {
      type: Array,
      default: [],
    },
  },
  wordle: {
    games: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
  },
  number: {
    games: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    recentScore: {
      type: Number,
      default: 0,
    },
  },
  minesweeper: {
    games: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
  },
  pacman: {
    games: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
  },
  frogger: {
    games: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
  },
  snake: {
    games: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    recentScore: {
      type: Number,
      default: 0,
    },
  },
  flappy: {
    games: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    recentScore: {
      type: Number,
      default: 0,
    },
  },
  doodle: {
    games: {
      type: Number,
      default: 0,
    },
    bestScore: {
      type: Number,
      default: 0,
    },
    recentScore: {
      type: Number,
      default: 0,
    },
  },
  speed: {
    games: {
      type: Number,
      default: 0,
    },
    wpm: {
      type: Number,
      default: 0,
    },
  },
  tenzies: {
    bestRolls: {
      type: Number,
      default: 0,
    },
    bestTime: {
      type: Number,
      default: 0,
    },
  },
  sudoku: {
    games: {
      type: Number,
      default: 0,
    },
    finishedEasy: {
      type: Number,
      default: 0,
    },
    finishedNormal: {
      type: Number,
      default: 0,
    },
    finishedHard: {
      type: Number,
      default: 0,
    },
    finishedVeryHard: {
      type: Number,
      default: 0,
    },
  },
  timeSpend: {
    wordle: {
      type: Number,
      default: 0,
    },
    number: {
      type: Number,
      default: 0,
    },
    snake: {
      type: Number,
      default: 0,
    },
    flappy: {
      type: Number,
      default: 0,
    },
    sudoku: {
      type: Number,
      default: 0,
    },
    doodle: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      default: 0,
    },
    minesweeper: {
      type: Number,
      default: 0,
    },
    platformer: {
      type: Number,
      default: 0,
    },
    frogger: {
      type: Number,
      default: 0,
    },
    pacman: {
      type: Number,
      default: 0,
    },
    tenzies: {
      type: Number,
      default: 0,
    },
  },
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
