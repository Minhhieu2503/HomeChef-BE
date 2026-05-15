const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const users = await User.find({}, 'name email role');
    console.log('Total Users found:', users.length);
    console.log('Users:');
    users.forEach(u => {
      console.log(` - Name: "${u.name}", Email: "${u.email}", Role: "${u.role}"`);
    });
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
