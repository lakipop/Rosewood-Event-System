# Quick Commands for Rosewood Event System

## Start Development Server
```bash
npm run dev
```

## Stop Server
Press `Ctrl + C` in terminal

## Clear Cache and Restart (if issues persist)
```bash
# Windows PowerShell
Remove-Item -Recurse -Force .nuxt
npm run dev
```

## Check if MySQL is Running
```bash
# Check MySQL service status (Windows)
Get-Service MySQL*
```

## Test Database Connection
Create a test file `test-db.js`:
```javascript
const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'your_password',
      database: 'rosewood_events'
    });
    console.log('✅ Database connected successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

test();
```

Run: `node test-db.js`

## Useful URLs
- App: http://localhost:3000
- Register: http://localhost:3000/auth/register
- Login: http://localhost:3000/auth/login
- Dashboard: http://localhost:3000

## Common Issues

### Issue: Cannot connect to database
**Solution:** Check `.env` file has correct credentials

### Issue: Port 3000 already in use
**Solution:** 
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill that process (replace PID)
taskkill /PID <PID> /F

# Or use different port
$env:PORT=3001; npm run dev
```

### Issue: TypeScript errors in IDE
**Solution:** These are expected! Nuxt uses auto-imports. The app will work fine.

### Issue: Module not found
**Solution:**
```bash
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```
