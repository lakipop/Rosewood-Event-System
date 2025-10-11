# ⚡ Quick Start Guide - Rosewood Event System

Get your ADBMS project up and running in minutes!

## 🎯 Prerequisites Check

Before starting, make sure you have:

- ✅ Node.js 18+ installed
- ✅ MySQL 8.0+ installed and running
- ✅ MySQL Workbench or MySQL CLI
- ✅ Your `.env` file configured

## 🚀 5-Step Setup

### Step 1: Install Dependencies (1 minute)

```bash
npm install
```

### Step 2: Create Database (1 minute)

Open MySQL Workbench and run:

```sql
CREATE DATABASE IF NOT EXISTS rosewood_events;
USE rosewood_events;
```

Execute this file:
```
database/schema/create_tables.sql
```

### Step 3: Install Database Features (3 minutes)

Execute these files **in order** in MySQL Workbench:

1. `database/indexes/all_indexes.sql` (30+ indexes)
2. `database/functions/all_functions.sql` (7 functions)
3. `database/procedures/all_procedures.sql` (5 procedures)
4. `database/views/all_views.sql` (7 views)
5. `database/triggers/all_triggers.sql` (8 triggers)

### Step 4: Insert Sample Data (1 minute)

```bash
node insert-sample-data.js
```

This creates 100+ sample records including:
- 10 Users (password: Test123)
- 10 Event types
- 10 Services
- 10 Events
- 10 Payments
- And more!

### Step 5: Start Application (1 minute)

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔐 Test Login

Use these accounts to test:

**Admin Account:**
- Email: `ruwan.bandara@gmail.com`
- Password: `Test123`

**Manager Account:**
- Email: `dilshan.fernando@gmail.com`
- Password: `Test123`

**Client Account:**
- Email: `kamal.perera@gmail.com`
- Password: `Test123`

**Your Account:**
- Email: `lakindu02@gmail.com`
- Password: [Your original password]

---

## 🎓 Quick Demo Script

### 1. Test Authentication
1. Go to http://localhost:3000/auth/login
2. Login with `kamal.perera@gmail.com` / `Test123`
3. See personalized dashboard

### 2. View Dashboard
- See list of events
- Notice role-based filtering (clients see only their events)
- Check event status badges

### 3. Browse Services
1. Click "🛎️ Services" in sidebar
2. Filter by category
3. See service details with pricing

### 4. Test Admin Features
1. Logout and login as admin (`ruwan.bandara@gmail.com` / `Test123`)
2. Go to Services page
3. Click "➕ Add Service"
4. Create a new service
5. Edit existing services

### 5. Verify Database Features

Open MySQL Workbench and run:

```sql
-- Test Views
SELECT * FROM v_event_summary LIMIT 5;
SELECT * FROM v_service_stats;

-- Test Functions
SELECT fn_calculate_event_cost(1) as event_cost;
SELECT fn_days_until_event('2025-12-31') as days_left;

-- Test Procedures
CALL sp_get_event_summary(1);

-- Check Triggers (look at activity logs)
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10;
```

---

## 📊 What You Have Now

### Database (80% - ADBMS Focus)
✅ 7 tables with proper constraints  
✅ 5 stored procedures  
✅ 7 user-defined functions  
✅ 7 database views  
✅ 8 automated triggers  
✅ 30+ performance indexes  
✅ 100+ sample records  

### Application (20% - Supporting UI)
✅ Authentication system  
✅ Dashboard with events  
✅ Services management  
✅ Role-based access  
✅ Dark theme UI  

---

## 🛠️ Common Issues

### "Cannot connect to database"
**Solution:** Check your `.env` file credentials

### "Table already exists"
**Solution:** Either drop tables first or skip table creation if already done

### "Port 3000 in use"
**Solution:** 
```bash
# Windows PowerShell
$env:PORT=3001; npm run dev
```

### "Function already exists"
**Solution:** MySQL will show error but continue - it's okay!

---

## 📝 Next Steps

1. **Explore the code:**
   - Check `database/` folder for all SQL files
   - Review `server/api/` for API endpoints
   - Look at `pages/` for Vue components

2. **Test features:**
   - Create new events
   - Manage services
   - Check activity logs
   - Test role permissions

3. **Prepare presentation:**
   - Show stored procedures in action
   - Demonstrate triggers with activity logs
   - Query views for reports
   - Explain indexes benefit

4. **Customize:**
   - Add more event types
   - Create more services
   - Customize color theme
   - Add your own features

---

## 🎉 You're Ready!

Your ADBMS project is now fully set up and ready for demonstration!

**Key Features to Highlight:**
- Advanced database features (procedures, functions, views, triggers)
- Performance optimization (indexes)
- Full-stack implementation (Nuxt 3 + MySQL)
- Role-based access control
- Complete audit trail (activity logs)
- Sri Lankan cultural theme

**Total Setup Time: ~7 minutes** ⚡

Good luck with your ADBMS project! 🌲
