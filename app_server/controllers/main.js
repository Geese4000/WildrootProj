// Dummy data for now — this stands in for the database until Mongoose/MongoDB
// are wired up in the next milestone.
const demoUser = {
  username: 'Rowan Mosswalker',
  email: 'rowan@mooncircle.com',
  password: 'moonlitgrove'
};

const wildShapes = [
  {
    name: 'Dire Wolf',
    creatureType: 'Large beast',
    armorClass: 14,
    hitPoints: 37,
    tags: ['pack tactics', 'keen hearing']
  },
  {
    name: 'Giant Eagle',
    creatureType: 'Large beast',
    armorClass: 13,
    hitPoints: 26,
    tags: ['flying']
  },
  {
    name: 'Brown Bear',
    creatureType: 'Large beast',
    armorClass: 11,
    hitPoints: 34,
    tags: ['multiattack']
  }
];

const login = function(req, res) {
  res.render('login', { title: 'Log in — Wildroot', demoUser });
};

const register = function(req, res) {
  res.render('register', { title: 'Register — Wildroot', demoUser });
};

const archive = function(req, res) {
  res.render('archive', { title: 'Wild Shape Archive — Wildroot', wildShapes });
};

module.exports = {
  login,
  register,
  archive
};
