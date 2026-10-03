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

async function seed() {
  await mongoose.connection.asPromise();
  await User.deleteMany({ email: demoUser.email });
  await WildShape.deleteMany({});
  await User.create(demoUser);
  await WildShape.insertMany(wildShapes);
  console.log('Seeded demo user + wild shapes.');
  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
  process.exitCode = 1;
});
