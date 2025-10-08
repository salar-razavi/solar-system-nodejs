// seed-planets.js
const mongoose = require('mongoose');
const Planet = require('./models/planet'); // مسیر درست مدل خودت
const uri = process.env.MONGO_URI; // همان uri که در app استفاده می‌کنی

async function run() {
  await mongoose.connect(uri);
  await Planet.deleteMany({});
  await Planet.insertMany([
  {
    id: 1,
    name: 'Mercury',
    image: '/images/mercury.png',
    description: 'Mercury is the smallest planet in our solar system and closest to the Sun.'
  },
  {
    id: 2,
    name: 'Venus',
    image: '/images/venus.png',
    description: 'Venus has a thick atmosphere that traps heat, making it the hottest planet.'
  },
  {
    id: 3,
    name: 'Earth',
    image: '/images/earth.png',
    description: 'Earth is the only planet known to support life, with oceans and breathable air.'
  },
  {
    id: 4,
    name: 'Mars',
    image: '/images/mars.png',
    description: 'Mars is called the Red Planet because of its reddish iron oxide surface.'
  },
  {
    id: 5,
    name: 'Jupiter',
    image: '/images/jupiter.png',
    description: 'Jupiter is the largest planet, known for its Great Red Spot storm.'
  },
  {
    id: 6,
    name: 'Saturn',
    image: '/images/saturn.png',
    description: 'Saturn has the most spectacular ring system made of ice and rock.'
  },
  {
    id: 7,
    name: 'Uranus',
    image: '/images/uranus.png',
    description: 'Uranus rotates on its side and has a faint ring system.'
  },
  {
    id: 8,
    name: 'Neptune',
    image: '/images/neptune.png',
    description: 'Neptune is a windy planet with deep blue clouds and supersonic storms.'
  }
  ]);
  console.log('Seed done');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
