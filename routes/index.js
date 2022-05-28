const express = require('express');
const router = express.Router();
const path = require('path');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const Grid = require('gridfs-stream');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

const User = require('../models/User');
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const { AsyncLocalStorage } = require('async_hooks');

const conn = mongoose.createConnection(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

router.post('/dashboard/upload', ensureAuthenticated, async (req, res) => {
  const result = await User.find({});
  upload.single('file')(req, res, async (err) => {
    gfs.files.find().toArray(async (e, files) => {
      if (files) {
        if (err) {
          files.map((file) => {
            if (
              file.contentType == 'image/jpeg' ||
              file.contentType === 'image/png'
            ) {
              file.isImage = true;
            } else {
              file.isImage = false;
            }
          });
          res.render('dashboard', {
            msg: err,
            layout: 'main',
            user: req.user,
            players: result,
            files: files,
          });
        } else {
          if (req.file == undefined) {
            res.render('dashboard', {
              msg: 'File not selected',
              layout: 'main',
              user: req.user,
              players: result,
              files: files,
            });
          } else {
            gfs.remove(
              {
                filename: req.user.filename,
                root: 'uploads',
              },
              (err, gridStore) => {
                if (err) {
                  return res.status(404).json({ err: err });
                }
              }
            );
            await User.updateOne(
              {
                name: req.user.name,
              },
              {
                $set: {
                  filename: req.file.filename,
                },
              }
            );
            res.redirect('/dashboard');
          }
        }
      }
    });
  });
  // res.json({ file: req.file });
  //res.redirect('/dashboard');
});

// @route GET /files
// @desc Display all files in JSON
router.get('/dashboard/files', (req, res) => {
  gfs.files.find().toArray((err, files) => {
    // Check if file
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
      });
    }
    // File exists
    return res.json(files);
  });
});

// @route GET /files/:filename

router.get('/dashboard/files/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
      });
    }

    // File exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/dashboard/image/:filename', (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: 'No file exists',
      });
    }
    // Check if image

    if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
      // Read output to browser
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } else {
      res.status(404).json({
        err: 'Not an image',
      });
    }
  });
});

// @route GET /image/:filename
// @desc Display Image
router.get('/dashboard/getimage/:username', async (req, res) => {
  if (req.params.username) {
    const user = await User.findOne({ name: req.params.username });
    if (user) {
      if (user.filename) {
        gfs.files.findOne({ filename: user.filename }, (err, file) => {
          // Check if file
          if (!file || file.length === 0) {
            return res.status(404).json({
              err: 'No file exists',
            });
          }
          // Check if image

          if (
            file.contentType === 'image/jpeg' ||
            file.contentType === 'image/png'
          ) {
            // Read output to browser
            const readStream = gfs.createReadStream(file.filename);
            readStream.pipe(res);
          } else {
            res.status(404).json({
              err: 'Not an image',
            });
          }
        });
        // } else {
        //   return res.status(404).json({
        //     err: 'No file exists',
        //   });
      } else {
        res.sendFile(path.join(__dirname + '/../public/img/default.png'));
      }
    } else {
      // return res.status(404).json({
      //   err: 'No file exists',
      // });
      res.sendFile(path.join(__dirname + '/../public/img/default.png'));
    }
  }
});

// @route DELETE /files/:id
// @desc Delete file

router.delete('/dashboard/files/:id', (req, res) => {
  gfs.remove(
    {
      _id: req.params.id,
      root: 'uploads',
    },
    (err, gridStore) => {
      if (err) {
        return res.status(404).json({ err: err });
      }

      res.redirect('/dashboard');
    }
  );
});

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('welcome');
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  const result = await User.find({});

  gfs.files.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      res.render('dashboard', {
        layout: 'main',
        user: req.user,
        players: result,
        files: false,
      });
    } else {
      files.map((file) => {
        if (
          file.contentType == 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.render('dashboard', {
        layout: 'main',
        user: req.user,
        players: result,
        files: files,
      });
    }
  });
});

// Wordle
router.get('/dashboard/wordle', ensureAuthenticated, (req, res) => {
  res.render('wordle', {
    layout: 'wordleLayout',
    user: req.user,
  });
});

// Platformer
router.get('/dashboard/platformer', ensureAuthenticated, (req, res) => {
  res.render('platformer', {
    layout: 'default',
    user: req.user,
  });
});

// Minesweeper
router.get('/dashboard/minesweeper', ensureAuthenticated, (req, res) => {
  res.render('minesweeper', {
    layout: 'default',
    user: req.user,
  });
});

// Battleship
router.get('/dashboard/battleship', ensureAuthenticated, (req, res) => {
  res.render('battleship', {
    layout: 'default',
    user: req.user,
  });
});

// Speed
router.get('/dashboard/speed', ensureAuthenticated, (req, res) => {
  res.render('speed', {
    layout: 'default',
    user: req.user,
  });
});

// 2048
router.get('/dashboard/2048', ensureAuthenticated, (req, res) => {
  res.render('2048', {
    layout: 'default',
    user: req.user,
  });
});
// Snake
router.get('/dashboard/snake', ensureAuthenticated, (req, res) => {
  res.render('snake', {
    layout: 'default',
    user: req.user,
  });
});

// Flappy
router.get('/dashboard/flappy', ensureAuthenticated, (req, res) => {
  res.render('flappy', {
    layout: 'default',
    user: req.user,
  });
});

// Sudoku
router.get('/dashboard/sudoku', ensureAuthenticated, (req, res) => {
  res.render('sudoku', {
    layout: 'default',
    user: req.user,
  });
});

// Doodle
router.get('/dashboard/doodle', ensureAuthenticated, (req, res) => {
  res.render('doodle', {
    layout: 'default',
    user: req.user,
  });
});

// Pacman
router.get('/dashboard/pacman', ensureAuthenticated, (req, res) => {
  res.render('pacman', {
    layout: 'default',
    user: req.user,
  });
});

// Frogger
router.get('/dashboard/frogger', ensureAuthenticated, (req, res) => {
  res.render('frogger', {
    layout: 'default',
    user: req.user,
  });
});

// Tenzies
router.get('/dashboard/tenzies', ensureAuthenticated, (req, res) => {
  res.render('tenzies', {
    layout: 'default',
    user: req.user,
  });
});

// Quizzical
router.get('/dashboard/quizzical', ensureAuthenticated, (req, res) => {
  res.render('quizzical', {
    layout: 'default',
    user: req.user,
  });
});

// Agar.io
router.get('/dashboard/agario', ensureAuthenticated, (req, res) => {
  res.render('agario', {
    layout: 'default',
    user: req.user,
  });
});

// Space invaders
router.get('/dashboard/spaceinvaders', ensureAuthenticated, (req, res) => {
  res.render('spaceinvaders', {
    layout: 'default',
    user: req.user,
  });
});

// Memory game
router.get('/dashboard/memory', ensureAuthenticated, (req, res) => {
  res.render('memory', {
    layout: 'default',
    user: req.user,
  });
});

// 2048 game over
router.post(
  '/dashboard/2048/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { status, score } = req.body;
    if (status === 'win') {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'number.games': 1,
            'number.wins': 1,
          },
          $set: {
            'number.recentScore': score,
          },
        }
      );
    } else {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'number.games': 1,
          },
          $set: {
            'number.recentScore': score,
          },
        }
      );
    }
    if (score > req.user.number.bestScore) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'number.bestScore': score,
          },
        }
      );
    }
    res.json({ status: 'ok' });
  }
);

// Snake game over
router.post(
  '/dashboard/snake/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { score } = req.body;
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'snake.games': 1,
        },
        $set: {
          'snake.recentScore': score,
        },
      }
    );
    if (score > req.user.snake.bestScore) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'snake.bestScore': score,
          },
        }
      );
    }

    res.json({ status: 'ok' });
  }
);

// Flappy game over
router.post(
  '/dashboard/flappy/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { score } = req.body;

    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'flappy.games': 1,
        },
        $set: {
          'flappy.recentScore': score,
        },
      }
    );
    if (score > req.user.flappy.bestScore) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'flappy.bestScore': score,
          },
        }
      );
    }

    res.json({ status: 'ok' });
  }
);

// Flappy game over
router.post(
  '/dashboard/doodle/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { score } = req.body;

    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'doodle.games': 1,
        },
        $set: {
          'doodle.recentScore': score,
        },
      }
    );
    if (score > req.user.doodle.bestScore) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'doodle.bestScore': score,
          },
        }
      );
    }

    res.json({ status: 'ok' });
  }
);

// Speed typing game over
router.post(
  '/dashboard/speed/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { score } = req.body;

    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'speed.games': 1,
        },
      }
    );

    if (score > req.user.speed.wpm) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'speed.wpm': score,
          },
        }
      );
    }

    res.json({ status: 'ok' });
  }
);

// Sudoku game over
router.post(
  '/dashboard/sudoku/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { level } = req.body;
    if (level == 'Easy') {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'sudoku.games': 1,
            'sudoku.finishedEasy': 1,
          },
        }
      );
    } else if (level == 'Normal') {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'sudoku.games': 1,
            'sudoku.finishedNormal': 1,
          },
        }
      );
    } else if (level == 'Hard') {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'sudoku.games': 1,
            'sudoku.finishedHard': 1,
          },
        }
      );
    } else {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'sudoku.games': 1,
            'sudoku.finishedVeryHard': 1,
          },
        }
      );
    }
    res.json({ status: 'ok' });
  }
);

// Sudoku game over
router.post(
  '/dashboard/minesweeper/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { status } = req.body;
    if (status == 'win') {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'minesweeper.games': 1,
            'minesweeper.wins': 1,
          },
        }
      );
    } else {
      await User.updateOne(
        { name: req.user.name },
        { $inc: { 'minesweeper.games': 1 } }
      );
    }

    res.json({ status: 'ok' });
  }
);
// Tenzies game over
router.post(
  '/dashboard/tenzies/gameOver',
  ensureAuthenticated,
  async (req, res) => {
    const { rolls, time } = req.body;

    if (req.user.tenzies.bestRolls == 0) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'tenzies.bestRolls': rolls,
          },
        }
      );
    } else if (req.user.tenzies.bestRolls > rolls) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'tenzies.bestRolls': rolls,
          },
        }
      );
    }
    if (req.user.tenzies.bestTime == 0) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'tenzies.bestTime': time,
          },
        }
      );
    } else if (req.user.tenzies.bestTime > time) {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $set: {
            'tenzies.bestTime': time,
          },
        }
      );
    }
    res.json({ status: 'ok' });
  }
);

// time on page spend
router.post('/dashboard/time', ensureAuthenticated, async (req, res) => {
  const { game, elapsedTime } = req.body;

  if (game === 'wordle') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.wordle': elapsedTime / 1000,
        },
      }
    );
  } else if (game === '2048') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.number': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Snake') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.snake': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Flappy Bird') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.flappy': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Sudoku') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.sudoku': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Doodle Jump') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.doodle': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Speed Typing Game') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.speed': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Minesweeper') {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $inc: {
          'timeSpend.minesweeper': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Platformer') {
    await User.updateOne(
      { name: req.user.name },
      {
        $inc: {
          'timeSpend.platformer': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Pacman') {
    await User.updateOne(
      { name: req.user.name },
      {
        $inc: {
          'timeSpend.pacman': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Frogger') {
    await User.updateOne(
      { name: req.user.name },
      {
        $inc: {
          'timeSpend.frogger': elapsedTime / 1000,
        },
      }
    );
  } else if (game == 'Tenzies') {
    await User.updateOne(
      { name: req.user.name },
      {
        $inc: {
          'timeSpend.tenzies': elapsedTime / 1000,
        },
      }
    );
  }
  res.json({ status: 'ok' });
});

// wordle game over
router.post(
  '/dashboard/wordle/gameover',
  ensureAuthenticated,
  async (req, res) => {
    const { status } = req.body;
    const currentStreak = req.user.wordle.currentStreak + 1;
    if (status === 'win') {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'wordle.games': 1,
            'wordle.wins': 1,
            'wordle.currentStreak': 1,
          },
        }
      );
      if (currentStreak > req.user.wordle.bestStreak) {
        await User.updateOne(
          {
            name: req.user.name,
          },
          {
            $set: {
              'wordle.bestStreak': currentStreak,
            },
          }
        );
      }
    } else {
      await User.updateOne(
        {
          name: req.user.name,
        },
        {
          $inc: {
            'wordle.games': 1,
          },
          $set: {
            'wordle.currentStreak': 0,
          },
        }
      );
    }

    res.json({ status: 'ok' });
  }
);

// get info about the
router.get('/dashboard/data', ensureAuthenticated, async (req, res) => {
  const allUsers = await User.find({});
  res.json({
    users: allUsers,
  });
});
// get info about the
router.get('/dashboard/data/me', ensureAuthenticated, async (req, res) => {
  res.json({
    user: req.user,
  });
});

// get chat history
router.post(
  '/dashboard/chat/history',
  ensureAuthenticated,
  async (req, res) => {
    const room = req.body.room;
    const query = await User.findOne({ name: 'chatcord' });
    if (room == 'Wordle') {
      res.json({
        chat: query.messages.wordle,
      });
    } else if (room == '2048') {
      res.json({
        chat: query.messages.number,
      });
    } else if (room == 'Snake') {
      res.json({
        chat: query.messages.snake,
      });
    } else if (room == 'Flappy Bird') {
      res.json({
        chat: query.messages.flappy,
      });
    } else if (room == 'Platformer') {
      res.json({
        chat: query.messages.platformer,
      });
    } else if (room == 'Minesweeper') {
      res.json({
        chat: query.messages.minesweeper,
      });
    } else if (room == 'Doodle Jump') {
      res.json({
        chat: query.messages.doodle,
      });
    } else if (room == 'Speed Typing') {
      res.json({
        chat: query.messages.speed,
      });
    } else if (room == 'Sudoku') {
      res.json({
        chat: query.messages.sudoku,
      });
    } else if (room == 'Frogger') {
      res.json({
        chat: query.messages.frogger,
      });
    }
  }
);

module.exports = router;
