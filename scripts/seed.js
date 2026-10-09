// One-off helper: populates MongoDB with the same demo user + wild shapes
// the app used to hardcode in the controller. Run with `npm run seed` after
// MONGODB_URI is set (see .env.example).
require('dotenv').config();

const mongoose = require('../app_server/models/db');
const User = require('../app_server/models/user');
const WildShape = require('../app_server/models/wildshape');

const demoUser = {
  username: 'Rowan Mosswalker',
  email: 'rowan@mooncircle.com',
  password: 'moonlitgrove'
};

const wildShapes = [
  {
    name: 'Dire Wolf',
    size: 'Large',
    creatureType: 'beast',
    armorClass: 14,
    hitPoints: 37,
    speed: '50 ft.',
    challengeRating: '1',
    tags: ['Pack tactics', 'Keen hearing']
  },
  {
    name: 'Giant Eagle',
    size: 'Large',
    creatureType: 'beast',
    armorClass: 13,
    hitPoints: 26,
    speed: '10 ft., fly 80 ft.',
    challengeRating: '1',
    tags: ['Keen sight', 'Flying']
  },
  {
    name: 'Brown Bear',
    size: 'Large',
    creatureType: 'beast',
    armorClass: 11,
    hitPoints: 34,
    speed: '40 ft., climb 30 ft.',
    challengeRating: '1',
    tags: ['Keen smell', 'Multiattack']
  }
];

async function seed() {
  await mongoose.connection.asPromise();
  // Wipes ALL wild shapes, not just the demo user's — this is a dev reset
  // script, not a migration. Re-run it any time you want a clean slate.
  await User.deleteMany({ email: demoUser.email });
  await WildShape.deleteMany({});
  const user = await User.create(demoUser);
  const owned = wildShapes.map((ws) => ({ ...ws, owner: user._id }));
  await WildShape.insertMany(owned);
  console.log('Seeded demo user + wild shapes (owned by ' + user.email + ').');
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
  process.exitCode = 1;
});
