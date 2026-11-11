const passport = require('passport');
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
    profileName: req.user.username,
    profileEmail: req.user.email,
    profileInitials: initials(req.user.username)
  };
}

// "Pack Tactics: Has advantage on an attack roll ..." (one trait/action per
// textarea line) -> [{ name: 'Pack Tactics', description: 'Has advantage...' }]
function parseNamedEntries(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf(':');
      if (i === -1) return { name: line, description: '' };
      return { name: line.slice(0, i).trim(), description: line.slice(i + 1).trim() };
    });
}

// "Dex +4, Con +5" -> ["Dex +4", "Con +5"]
function parseList(text) {
  if (!text) return [];
  return text.split(',').map((s) => s.trim()).filter(Boolean);
}

const login = function(req, res) {
  if (req.isAuthenticated()) return res.redirect('/archive');
  res.render('login', { title: 'Log in — Wildroot' });
};

// POST /login — Passport's local strategy checks the email + bcrypt hash.
// A custom callback is used so a failed login re-renders the form with an
// error message instead of just redirecting.
const postLogin = function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).render('login', {
        title: 'Log in — Wildroot',
        error: info && info.message ? info.message : 'Email or password is incorrect.'
      });
    }
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.redirect('/archive');
    });
  })(req, res, next);
};

const register = function(req, res) {
  if (req.isAuthenticated()) return res.redirect('/archive');
  res.render('register', { title: 'Register — Wildroot' });
};

// POST /register — the User model hashes the password on save, then the new
// user is logged straight in with req.login().
const postRegister = async function(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.redirect('/archive');
    });
  } catch (err) {
    const message = err.code === 11000
      ? 'That email is already registered.'
      : err.message;
    res.render('register', { title: 'Register — Wildroot', error: message });
  }
};

// GET /logout — end the Passport login, then destroy the whole session
const logout = function(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  });
};

// GET /archive — supports ?tag=<tag> to filter down to Wild Shapes carrying
// that tag. The filter pills themselves are built from whatever tags the
// user has actually used, via WildShape.distinct(), so the list is always
// real data, never a hardcoded guess at categories.
const archive = async function(req, res) {
  try {
    const owner = req.user._id;
    const activeTag = typeof req.query.tag === 'string' && req.query.tag.trim() ? req.query.tag.trim() : null;

    const findConditions = { owner };
    if (activeTag) findConditions.tags = activeTag;

    const [wildShapes, totalCount, allTags] = await Promise.all([
      WildShape.find(findConditions).sort({ name: 1 }),
      WildShape.countDocuments({ owner }),
      WildShape.distinct('tags', { owner })
    ]);

    res.render('archive', {
      title: 'Wild Shape Archive — Wildroot',
      wildShapes,
      totalCount,
      allTags: allTags.sort(),
      activeTag,
      ...profileLocals(req)
    });
  } catch (err) {
    res.render('error', { message: err.message, error: err });
  }
};

const newWildShape = function(req, res) {
  res.render('add-wild-shape', {
    title: 'Add a Wild Shape — Wildroot',
    error: null,
    ...profileLocals(req)
  });
};

const postWildShape = async function(req, res) {
  try {
    const b = req.body;
    await WildShape.create({
      name: b.name,
      size: b.size,
      creatureType: b.creatureType,

      armorClass: Number(b.armorClass),
      armorClassNote: b.armorClassNote || undefined,
      hitPoints: Number(b.hitPoints),
      hitDice: b.hitDice || undefined,
      speed: b.speed,

      abilities: {
        str: Number(b.str),
        dex: Number(b.dex),
        con: Number(b.con),
        int: Number(b.int),
        wis: Number(b.wis),
        cha: Number(b.cha)
      },

      savingThrows: parseList(b.savingThrows),
      skills: parseList(b.skills),

      damageVulnerabilities: parseList(b.damageVulnerabilities),
      damageResistances: parseList(b.damageResistances),
      damageImmunities: parseList(b.damageImmunities),
      conditionImmunities: parseList(b.conditionImmunities),

      senses: b.senses || undefined,

      challengeRating: b.challengeRating,

      traits: parseNamedEntries(b.traits),
      actions: parseNamedEntries(b.actions),

      tags: parseList(b.tags),
      owner: req.user._id
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
