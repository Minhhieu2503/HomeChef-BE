const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const email = 'admin@homechef.com';
    const password = 'admin123';
    
    const existing = await User.findOne({ email });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existing) {
      console.log(`Admin user ${email} already exists. Updating to admin role and setting password...`);
      existing.password = hashedPassword;
      existing.role = 'admin';
      await existing.save();
      console.log('Admin user updated!');
    } else {
      console.log(`Creating admin user ${email}...`);
      await User.create({
        name: 'System Admin',
        email: email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created successfully!');
    }
    
    console.log('Credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
