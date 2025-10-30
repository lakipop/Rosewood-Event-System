// Test Database Connection
// Run this with
//node check-db-connection.js  
  
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MySQL Database Connection...\n');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT || '3306')
    });

    console.log('✅ Database connected successfully!');
    console.log('📊 Connection Details:');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);
    console.log(`   Port: ${process.env.DB_PORT || '3306'}\n`);

    // Test query - check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables in database:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

    // Test count of records in each table
    console.log('\n📊 Record counts:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   ${tableName}: ${result[0].count} records`);
    }

    await connection.end();
    console.log('\n✅ Connection test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n📝 Check your .env file:');
    console.error(`   DB_HOST=${process.env.DB_HOST}`);
    console.error(`   DB_USER=${process.env.DB_USER}`);
    console.error(`   DB_PASSWORD=${process.env.DB_PASSWORD ? '****' : 'NOT SET'}`);
    console.error(`   DB_NAME=${process.env.DB_NAME}`);
    console.error(`   DB_PORT=${process.env.DB_PORT || '3306'}`);
    return false;
  }
}

// Run the test
testConnection();
