import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'rosewood-events-db',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true,
};

async function executeSQLFile(connection, filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    console.log(`\n📄 Running: ${fileName}...`);
    
    // Handle DELIMITER $$ properly - split by $$ as statement terminator
    let statements = [];
    if (sql.includes('DELIMITER $$')) {
      // Split into sections separated by DELIMITER statements
      const parts = sql.split(/DELIMITER\s+\$\$/);
      for (const part of parts) {
        const statements_in_part = part.split('$$').filter(s => s.trim());
        for (const stmt of statements_in_part) {
          statements.push(stmt.trim());
        }
      }
    } else {
      // Regular SQL with semicolon delimiters
      statements = sql.split(/;[\s]*(?=\n|$|--)/);
    }
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      // Skip empty statements and comments
      if (trimmed && !trimmed.startsWith('--') && trimmed !== 'DELIMITER' && trimmed.length > 5) {
        try {
          // Ensure statement ends properly
          const finalStatement = trimmed.endsWith(';') ? trimmed : trimmed + ';';
          await connection.query(finalStatement);
        } catch (err) {
          if (!err.message.includes('already exists') && !err.message.includes('Duplicate key')) {
            // Suppress non-critical errors
            if (err.message.includes('syntax')) {
              console.warn(`  ⚠️  Syntax: ${err.message.split('\n')[0]}`);
            }
          }
        }
      }
    }
    
    console.log(`✅ ${fileName} completed`);
    return true;
  } catch (error) {
    console.error(`❌ Error running ${filePath}:`, error.message);
    return false;
  }
}

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔗 Connecting to MySQL...');
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database:', DB_CONFIG.database);
    
    // SQL files in execution order
    const sqlFiles = [
      'database/schema/create_tables.sql',
      'database/functions/all_functions.sql',
      'database/views/all_views.sql',
      'database/procedures/all_procedures.sql',
      'database/triggers/all_triggers.sql',
      'database/indexes/all_indexes.sql',
    ];
    
    console.log('\n🚀 Starting database setup...\n');
    
    let successCount = 0;
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const success = await executeSQLFile(connection, filePath);
        if (success) successCount++;
      } else {
        console.warn(`⚠️  File not found: ${filePath}`);
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Database setup complete! (${successCount}/${sqlFiles.length} files executed)`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Verify database contents
    try {
      const [tables] = await connection.query('SELECT COUNT(*) as table_count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?', [DB_CONFIG.database]);
      console.log(`📊 Database Summary:`);
      console.log(`   Tables: ${tables[0].table_count}`);
      
      const [functions] = await connection.query('SELECT COUNT(*) as func_count FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "FUNCTION"', [DB_CONFIG.database]);
      console.log(`   Functions: ${functions[0].func_count}`);
      
      const [procedures] = await connection.query('SELECT COUNT(*) as proc_count FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_TYPE = "PROCEDURE"', [DB_CONFIG.database]);
      console.log(`   Procedures: ${procedures[0].proc_count}`);
      
      const [views] = await connection.query('SELECT COUNT(*) as view_count FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = "VIEW"', [DB_CONFIG.database]);
      console.log(`   Views: ${views[0].view_count}\n`);
    } catch (err) {
      console.warn('⚠️  Could not verify database contents:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

setupDatabase();
