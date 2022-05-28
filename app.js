const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const socketio = require('socket.io');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const bodyParser = require('body-parser');
const formatMessage = require('./config/messages');
const User = require('./models/User');
require('dotenv').config();
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require('./config/users');
const { accessSync } = require('fs');

const app = express();

// Passport Config
require('./config/passport')(passport);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Method override
app.use(methodOverride('_method'));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express session
app.use(
  session({
    secret: 'secret', //the cake is a lie
    resave: true,
    saveUninitialized: true,
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));

app.use(express.static(path.join(__dirname)));

// Run when clients connects

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, console.log(`Server running on  ${PORT}`));

const io = socketio(server);

// Battleship

let BattleshipGame = require('./config/game.js');
let GameStatus = require('./config/gameStatus.js');

let users = {};
let gameIdCounter = 1;

function makeid(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTYVXWZabcdefghijklmnopqrstyvxwz1234567890';
  let result = '';
  for (let i = 0; i < length; ++i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

// Sockets (chat and agar.io)

const Vector = require('./config/vector');
const playerData = require('./config/playerData');
const Leaderboard = require('./config/leaderboard');
const { getRandomInt, blobData } = require('./config/blobData');

let leaderboard = new Leaderboard();

let actualWidth = 10000;
let actualHeight = 10000;

let blobs = [];
let players = [];
// (!)
let maxBlobs = 500;

for (let x = 0; x < maxBlobs; x++) {
  blobs.push(
    new blobData(
      getRandomInt(-actualWidth / 2, actualWidth / 2),
      getRandomInt(-actualHeight / 2, actualHeight / 2)
    )
  );
}

function secondOperations() {
  players.forEach((player) => player.shrink());

  io.emit('leaderboardData', leaderboard.board);
  leaderboard.organize();
}

setInterval(secondOperations, 1000);

io.on('connection', (socket) => {
  console.log(new Date().toISOString() + ' ID ' + socket.id + ' connected.');
  users[socket.id] = {
    inGame: null,
    player: null,
  };
  console.log(users);
  /**
   * Handle chat messages in Battleship
   */
  socket.on('chat', function (msg) {
    if (users[socket.id].inGame !== null && msg) {
      console.log(
        new Date().toISOString() +
          ' Chat message from ' +
          socket.id +
          ': ' +
          msg
      );

      // Send message to opponent
      socket.broadcast.to('game' + users[socket.id].inGame.id).emit('chat', {
        name: 'Opponent',
        message: entities.encode(msg),
      });

      // Send message to self
      io.to(socket.id).emit('chat', {
        name: 'Me',
        message: entities.encode(msg),
      });
    }
  });
  /**
   * Handle shot from client
   */
  socket.on('shot', function (position) {
    let game = users[socket.id].inGame,
      opponent;

    if (game !== null) {
      // Is it this users turn?
      if (game.currentPlayer === users[socket.id].player) {
        opponent = game.currentPlayer === 0 ? 1 : 0;

        if (game.shoot(position)) {
          // Valid shot
          checkGameOver(game);

          // Update game state on both clients.
          io.to(socket.id).emit(
            'update',
            game.getGameState(users[socket.id].player, opponent)
          );
          io.to(game.getPlayerId(opponent)).emit(
            'update',
            game.getGameState(opponent, opponent)
          );
        }
      }
    }
  });

  /**
   * Handle leave game request
   */
  socket.on('leave', function () {
    if (users[socket.id].inGame !== null) {
      leaveGame(socket);

      socket.join('waiting room');
      joinWaitingPlayers();
    }
  });

  socket.on('find-game', function () {
    // join waiting room until there are enough players to start a new game
    socket.join('waiting room');
    joinWaitingPlayers();
  });

  socket.on('join-game', function (gameCode) {
    socket.join(gameCode);
    let players = getClientsInRoom(gameCode);

    if (players.length >= 2) {
      // 2 player waiting. Create new game!
      let game = new BattleshipGame(
        gameIdCounter++,
        players[0].id,
        players[1].id
      );

      // create new room for this game
      players[0].leave(gameCode);
      players[1].leave(gameCode);
      players[0].join('game' + game.id);
      players[1].join('game' + game.id);

      users[players[0].id].player = 0;
      users[players[1].id].player = 1;
      users[players[0].id].inGame = game;
      users[players[1].id].inGame = game;

      io.to('game' + game.id).emit('join', game.id);

      // send initial ship placements
      io.to(players[0].id).emit('update', game.getGameState(0, 0));
      io.to(players[1].id).emit('update', game.getGameState(1, 1));

      console.log(
        new Date().toISOString() +
          ' ' +
          players[0].id +
          ' and ' +
          players[1].id +
          ' have joined game ID ' +
          game.id
      );
    }
  });

  socket.on('create-game', function () {
    let gameCode = makeid(5);
    socket.emit('code', gameCode);
    socket.join(gameCode);
  });
  // Agar.io starts here
  socket.on('init', (data) => {
    let newPlayer = new playerData(
      socket.id,
      data.name,
      data.canvas.w,
      data.canvas.h
    );

    players.push(newPlayer);

    leaderboard.add(data.name, 5, socket.id);

    socket.emit('playerData', newPlayer);

    socket.emit('blobData', blobs);
  });

  socket.on('mouseData', (data) => {
    let player = players.find((player) => player.id == socket.id);

    if (player) {
      let vel = new Vector(
        data.mX - player.canvas.w / 2,
        data.mY - player.canvas.h / 2
      );

      vel.setMag(2.2 * Math.pow(player.r, -0.439) * 40);

      player.acc(vel);

      blobs.forEach((blob, index) => {
        if (player.see(blob)) {
          if (player.collideBlob(blob)) {
            blobs.splice(index, 1);
            blobs.push(
              new blobData(
                getRandomInt(-actualWidth / 2, actualWidth / 2),
                getRandomInt(-actualHeight / 2, actualHeight / 2)
              )
            );
            player.addMass(1);
          }
        }
      });

      players.forEach((otherPlayer) => {
        if (otherPlayer.id != player.id) {
          if (player.checkEat(otherPlayer)) {
            player.addMass(otherPlayer.m);
            otherPlayer.reset();
          }
        }
      });

      leaderboard.update(player.id, player.m);

      socket.emit('playerData', player);
      socket.emit('blobData', blobs);
      io.emit('Players', players);
    }
  });

  socket.on('disconnect', () => {
    console.log(
      new Date().toISOString() + ' ID ' + socket.id + ' disconnected.'
    );
    leaderboard.remove(socket.id);
    let index = players.findIndex((player) => player.id == socket.id);
    if (index !== -1) {
      players.splice(index, 1);
    }
    leaveGame(socket);
    delete users[socket.id];
    const user = userLeave(socket.id);
  });

  // Chat starts here
  socket.on('joinRoom', ({ id, room }) => {
    const user = userJoin(socket.id, id, room);

    socket.join(room);
  });

  socket.on('chatMessage', async (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.userID, msg));

    switch (user.room) {
      case 'Wordle':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.wordle': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case '2048':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.number': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Snake':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.snake': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Flappy Bird':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.flappy': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Minesweeper':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.minesweeper': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Sudoku':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.sudoku': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Doodle Jump':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.doodle': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Speed Typing':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.speed': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Platformer':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.platformer': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
      case 'Frogger':
        {
          await User.updateOne(
            { name: 'chatcord' },
            {
              $push: {
                'messages.frogger': formatMessage(user.userID, msg),
              },
            }
          );
        }
        break;
    }
    await User.updateOne(
      {
        _id: user.userID,
      },
      {
        $inc: {
          messagesSend: 1,
        },
      }
    );
  });
});

/**
 * Create games for players in waiting room
 */
function joinWaitingPlayers() {
  let players = getClientsInRoom('waiting room');

  if (players.length >= 2) {
    // 2 player waiting. Create new game!
    let game = new BattleshipGame(
      gameIdCounter++,
      players[0].id,
      players[1].id
    );

    // create new room for this game
    players[0].leave('waiting room');
    players[1].leave('waiting room');
    players[0].join('game' + game.id);
    players[1].join('game' + game.id);

    users[players[0].id].player = 0;
    users[players[1].id].player = 1;
    users[players[0].id].inGame = game;
    users[players[1].id].inGame = game;

    io.to('game' + game.id).emit('join', game.id);

    // send initial ship placements
    io.to(players[0].id).emit('update', game.getGameState(0, 0));
    io.to(players[1].id).emit('update', game.getGameState(1, 1));

    console.log(
      new Date().toISOString() +
        ' ' +
        players[0].id +
        ' and ' +
        players[1].id +
        ' have joined game ID ' +
        game.id
    );
  }
}

/**
 * Leave user's game
 * @param {type} socket
 */
function leaveGame(socket) {
  if (users[socket.id].inGame !== null) {
    console.log(
      new Date().toISOString() +
        ' ID ' +
        socket.id +
        ' left game ID ' +
        users[socket.id].inGame.id
    );

    // Notifty opponent
    socket.broadcast
      .to('game' + users[socket.id].inGame.id)
      .emit('notification', {
        message: 'Opponent has left the game',
      });

    if (users[socket.id].inGame.gameStatus !== GameStatus.gameOver) {
      // Game is unfinished, abort it.
      users[socket.id].inGame.abortGame(users[socket.id].player);
      checkGameOver(users[socket.id].inGame);
    }

    socket.leave('game' + users[socket.id].inGame.id);

    users[socket.id].inGame = null;
    users[socket.id].player = null;

    io.to(socket.id).emit('leave');
  }
}

/**
 * Notify players if game over.
 * @param {type} game
 */
function checkGameOver(game) {
  if (game.gameStatus === GameStatus.gameOver) {
    console.log(new Date().toISOString() + ' Game ID ' + game.id + ' ended.');
    io.to(game.getWinnerId()).emit('gameover', true);
    io.to(game.getLoserId()).emit('gameover', false);
  }
}

/**
 * Find all sockets in a room
 * @param {type} room
 * @returns {Array}
 */
function getClientsInRoom(room) {
  let clients = [];
  for (let id in io.sockets.adapter.rooms[room]) {
    clients.push(io.sockets.adapter.nsp.connected[id]);
  }
  return clients;
}


