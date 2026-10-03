const User = require('../models/user');
const WildShape = require('../models/wildshape');

const login = function(req, res) {
  res.render('login', { title: 'Log in — Wildroot' });
};

const postLogin = async function(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.render('login', {
        title: 'Log in — Wildroot',
        error: 'Email or password is incorrect.'
      });
    }
    // No sessions yet — Report 3 adds Passport.js + express-session.
    res.redirect('/archive');
  } catch (err) {
    res.render('login', { title: 'Log in — Wildroot', error: err.message });
  }
};

const register = function(req, res) {
  res.render('register', { title: 'Register — Wildroot' });
};

const postRegister = async function(req, res) {
  try {
    const { username, email, password } = req.body;
    await User.create({ username, email, password });
    res.redirect('/login');
  } catch (err) {
    const message = err.code === 11000
      ? 'That email is already registered.'
      : err.message;
    res.render('register', { title: 'Register — Wildroot', error: message });
  }
};

const archive = async function(req, res) {
  try {
    const wildShapes = await WildShape.find().sort({ name: 1 });
    res.render('archive', { title: 'Wild Shape Archive — Wildroot', wildShapes });
  } catch (err) {
    res.render('error', { message: err.message, error: err });
  }
};

module.exports = {
  login,
  postLogin,
  register,
  postRegister,
  archive
};
