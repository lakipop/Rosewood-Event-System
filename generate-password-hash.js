// Generate Bcrypt Password Hashes
// Run this with: node generate-password-hash.js

const bcrypt = require('bcryptjs');

async function generatePasswordHash(password) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

async function generateMultipleHashes() {
  console.log('🔐 Generating Bcrypt Password Hashes...\n');
  
  const passwords = [
    { name: 'Admin User', password: 'Admin123!' },
    { name: 'Manager User', password: 'Manager123!' },
    { name: 'Client User', password: 'Password123' },
    { name: 'Test User', password: 'Test123!' }
  ];

  for (const user of passwords) {
    const hash = await generatePasswordHash(user.password);
    console.log(`${user.name}:`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Hash: ${hash}\n`);
  }

  // Generate custom password
  const customPassword = 'YourPasswordHere';
  const customHash = await generatePasswordHash(customPassword);
  console.log('Custom Password:');
  console.log(`  Password: ${customPassword}`);
  console.log(`  Hash: ${customHash}\n`);

  console.log('✅ Copy these hashes to your seed SQL file!');
}

// Run the generator
generateMultipleHashes();
