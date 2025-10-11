// Check what ADBMS features currently exist in database
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkFeatures() {
  console.log('🔍 Checking Current Database Features...\n');
  
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Check Procedures
  const [procs] = await conn.query(
    'SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "PROCEDURE"',
    [process.env.DB_NAME]
  );
  console.log(`📊 Stored Procedures: ${procs.length}`);
  procs.forEach(p => console.log(`   - ${p.ROUTINE_NAME}`));

  // Check Functions
  const [funcs] = await conn.query(
    'SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "FUNCTION"',
    [process.env.DB_NAME]
  );
  console.log(`\n🔧 User-Defined Functions: ${funcs.length}`);
  funcs.forEach(f => console.log(`   - ${f.ROUTINE_NAME}`));

  // Check Views
  const [views] = await conn.query(
    'SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = ?',
    [process.env.DB_NAME]
  );
  console.log(`\n📈 Views: ${views.length}`);
  views.forEach(v => console.log(`   - ${v.TABLE_NAME}`));

  // Check Triggers
  const [triggers] = await conn.query(
    'SELECT TRIGGER_NAME FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = ?',
    [process.env.DB_NAME]
  );
  console.log(`\n⚡ Triggers: ${triggers.length}`);
  triggers.forEach(t => console.log(`   - ${t.TRIGGER_NAME}`));

  await conn.end();

  console.log('\n' + '='.repeat(60));
  console.log(`TOTAL ADBMS FEATURES: ${procs.length + funcs.length + views.length + triggers.length}`);
  console.log('='.repeat(60));
}

checkFeatures().catch(console.error);
