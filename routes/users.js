const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const path = require('path');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => {
  res.render('login');
});

// Register Page
router.get('/register', forwardAuthenticated, (req, res) =>
  res.render('register')
);

// Username change

router.post('/name/change', async (req, res) => {
  const check = await User.findOne({ name: req.body.name });
  if (check === null) {
    await User.updateOne(
      {
        name: req.user.name,
      },
      {
        $set: {
          name: req.body.name,
        },
      }
    );
    res.json({ status: 'ok' });
  } else {
    res.json({ msg: 'Username aleardy taken' });
  }
});

// About info change

router.post('/about/change', async (req, res) => {
  await User.updateOne(
    {
      name: req.user.name,
    },
    {
      $set: {
        about: req.body.about,
      },
    }
  );
  res.json({ status: 'ok' });
});

// Current country change

router.post('/country/change', async (req, res) => {
  await User.updateOne(
    {
      name: req.user.name,
    },
    {
      $set: {
        country: req.body.country,
      },
    }
  );
  res.json({ status: 'ok' });
});

// Email change

router.post('/email/change', async (req, res) => {
  const check = await User.findOne({ email: req.body.email });
  if (check === null) {
    await User.updateOne(
      {
        email: req.user.email,
      },
      {
        $set: {
          email: req.body.email,
        },
      }
    );
    res.json({ status: 'ok' });
  } else {
    res.json({ msg: 'Email aleardy in use' });
  }
});

// Password update

router.post('/password/change', async (req, res) => {
  bcrypt.compare(req.body.password, req.user.password, (err, isMatch) => {
    if (err) throw err;
    if (isMatch) {
      res.json({ status: 'not ok' });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(req.body.password, salt, async (err, hash) => {
          if (err) throw err;
          await User.updateOne(
            { name: req.user.name },
            {
              $set: {
                password: hash,
              },
            }
          );
        });
      });
      res.json({ status: 'ok' });
    }
  });
});

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        User.findOne({ name: name }).then((u) => {
          if (u) {
            errors.push({ msg: 'Username already taken' });
            res.render('register', {
              errors,
              name,
              email,
              password,
              password2,
            });
          } else {
            const newUser = new User({
              name,
              email,
              password,
            });

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      'success_msg',
                      'You are now registered and can log in'
                    );
                    res.redirect('/users/login');
                  })
                  .catch((err) => console.log(err));
              });
            });
          }
        });
      }
    });
  }
});

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
