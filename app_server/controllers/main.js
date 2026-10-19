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

// GET /archive — supports ?tag=<tag> to filter down to Wild Shapes carrying
// that tag. The filter pills themselves are built from whatever tags the
// user has actually used, via WildShape.distinct(), so the list is always
// real data, never a hardcoded guess at categories.
const archive = async function(req, res) {
  if (!req.session.userId) return res.redirect('/login');
  try {
    const owner = req.session.userId;
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
    const b = req.body;
    await WildShape.create({
      name: b.name,
      size: b.size,
      creatureType: b.creatureType,
      alignment: b.alignment || undefined,

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
      languages: b.languages || undefined,

      challengeRating: b.challengeRating,
      xp: b.xp ? Number(b.xp) : undefined,

      traits: parseNamedEntries(b.traits),
      actions: parseNamedEntries(b.actions),

      tags: parseList(b.tags),
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
