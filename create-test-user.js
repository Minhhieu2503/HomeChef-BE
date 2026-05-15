const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const email = 'test@homechef.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Test user already exists. Updating password to "password123"...');
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash('password123', salt);
      await existing.save();
      console.log('Password updated!');
    } else {
      console.log('Creating test user...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.create({
        name: 'Người dùng Thử nghiệm',
        email: email,
        password: hashedPassword,
        role: 'user'
      });
      console.log('Test user created successfully!');
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
