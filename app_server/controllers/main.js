const User = require('../models/user');
const WildShape = require('../models/wildshape');

// Short initials for the profile badge, e.g. "Rowan Mosswalker" -> "RM".
function initials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}

// Shared locals every logged-in page needs for the top nav / profile badge.
function profileLocals(req) {
  return {
    profileName: req.session.username,
    profileEmail: req.session.email,
    profileInitials: initials(req.session.username)
  };
}

const login = function(req, res) {
  if (req.session.userId) return res.redirect('/archive');
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
    req.session.userId = user._id.toString();
    req.session.username = user.username;
    req.session.email = user.email;
    res.redirect('/archive');
  } catch (err) {
    res.render('login', { title: 'Log in — Wildroot', error: err.message });
  }
};

const register = function(req, res) {
  if (req.session.userId) return res.redirect('/archive');
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

const logout = function(req, res) {
  req.session.destroy(() => res.redirect('/login'));
};

const archive = async function(req, res) {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const wildShapes = await WildShape.find({ owner: req.session.userId }).sort({ name: 1 });
    res.render('archive', {
      title: 'Wild Shape Archive — Wildroot',
      wildShapes,
      ...profileLocals(req)
    });
  } catch (err) {
    res.render('error', { message: err.message, error: err });
  }
};

const newWildShape = function(req, res) {
  if (!req.session.userId) return res.redirect('/login');
  res.render('add-wild-shape', {
    title: 'Add a Wild Shape — Wildroot',
    error: null,
    ...profileLocals(req)
  });
};

const postWildShape = async function(req, res) {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const { name, size, creatureType, armorClass, hitPoints, speed, challengeRating, tags } = req.body;
    await WildShape.create({
      name,
      size,
      creatureType,
      armorClass: Number(armorClass),
      hitPoints: Number(hitPoints),
      speed,
      challengeRating,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      owner: req.session.userId
    });
    res.redirect('/archive');
  } catch (err) {
    res.render('add-wild-shape', {
      title: 'Add a Wild Shape — Wildroot',
      error: err.message,
      ...profileLocals(req)
    });
  }
};

module.exports = {
  login,
  postLogin,
  register,
  postRegister,
  logout,
  archive,
  newWildShape,
  postWildShape
};
