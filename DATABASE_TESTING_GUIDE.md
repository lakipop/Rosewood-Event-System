# 🗄️ Database Setup & Testing Guide

## How to Use These Scripts

### 1️⃣ Test Database Connection

**Purpose:** Check if your database connection is working

```bash
node test-db-connection.js
```

**What it does:**
- ✅ Connects to your MySQL database
- ✅ Shows all tables in the database
- ✅ Shows record counts for each table
- ❌ Shows errors if connection fails

**Expected Output:**
```
✅ Database connected successfully!
📊 Connection Details:
   Host: localhost
   Database: rosewood_events
   User: root
   Port: 3306

📋 Tables in database:
   - users
   - event_types
   - services
   - events
   - event_services
   - payments
   - activity_logs
```

---

### 2️⃣ Generate Password Hashes

**Purpose:** Generate bcrypt hashes for passwords

```bash
node generate-password-hash.js
```

**What it does:**
- Creates bcrypt hashes for predefined passwords
- You can modify the script to hash your own passwords

**Output Example:**
```
🔐 Generating Bcrypt Password Hashes...

Admin User:
  Password: Admin123!
  Hash: $2a$10$abcd1234...

Manager User:
  Password: Manager123!
  Hash: $2a$10$efgh5678...
```

**How to customize:**
Edit the `passwords` array in the script:
```javascript
const passwords = [
  { name: 'Your Name', password: 'YourPassword123' }
];
```

---

### 3️⃣ Insert Sample Data

**Purpose:** Populate database with sample data including users with bcrypt passwords

```bash
node insert-sample-data.js
```

**What it inserts:**
1. **Event Types** - Wedding, Corporate, Birthday, etc.
2. **Services** - Catering, Photography, DJ, etc.
3. **Users** - With bcrypt hashed passwords
4. **Events** - Sample events with different statuses

**Default Login Credentials:**
```
Admin:   admin@rosewood.com / Admin123!
Manager: manager@rosewood.com / Manager123!
Client:  john.doe@email.com / Password123
```

---

## 📝 Customizing Sample Data

### What Data You Can Add:

#### 1. Event Types
```javascript
['Event Name', 'Description', BasePrice]

Examples:
['Wedding', 'Traditional wedding', 5000.00]
['Conference', 'Business conference', 3000.00]
```

#### 2. Services
```javascript
['Service Name', 'Category', 'Description', Price, 'unit_type']

Examples:
['Catering', 'Food', 'Full catering', 35.00, 'per_person']
['DJ Services', 'Entertainment', 'Professional DJ', 600.00, 'fixed']
```

#### 3. Users (with passwords)
```javascript
['email', 'Full Name', 'Phone', 'role', 'password']

Examples:
['user@email.com', 'John Doe', '+1234567890', 'client', 'Password123']

Roles: 'admin', 'manager', 'client'
```

#### 4. Events
```javascript
['Event Name', eventTypeId, clientId, 'date', 'time', 'venue', guests, budget, 'status']

Examples:
['Summer Wedding', 1, 3, '2025-07-15', '18:00:00', 'Hotel', 150, 15000.00, 'confirmed']

Status: 'inquiry', 'confirmed', 'completed', 'cancelled'
```

#### 5. Payments
```javascript
['Event ID', Amount, 'Method', 'Type', 'Date', 'Reference', 'Status']

Examples:
[1, 5000.00, 'bank_transfer', 'advance', '2025-01-15', 'REF001', 'completed']

Methods: 'cash', 'card', 'bank_transfer', 'online'
Types: 'advance', 'partial', 'final'
```

---

## 🔧 Step-by-Step Process

### Step 1: Check .env file
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=rosewood_events
DB_PORT=3306
```

### Step 2: Test Connection
```bash
node test-db-connection.js
```

If it fails:
- ✅ Check MySQL is running
- ✅ Verify password in .env
- ✅ Make sure database exists

### Step 3: (Optional) Generate Custom Passwords
```bash
node generate-password-hash.js
```

### Step 4: Insert Sample Data
```bash
node insert-sample-data.js
```

### Step 5: Test the App
```bash
npm run dev
```

Then login at: http://localhost:3000/auth/login

---

## 🎯 What Sample Data Should I Create?

For your ADBMS project, I recommend:

### Minimum Data Set:
- ✅ **3-5 Event Types** (Wedding, Corporate, Birthday, etc.)
- ✅ **10-15 Services** (Different categories: Food, Entertainment, etc.)
- ✅ **5-10 Users** (1 Admin, 1 Manager, 3-8 Clients)
- ✅ **10-20 Events** (Mix of statuses: inquiry, confirmed, completed)
- ✅ **5-10 Event-Service assignments**
- ✅ **5-10 Payments** (Different types: advance, partial, final)
- ✅ **Activity logs** (Will be auto-created by triggers)

### Realistic Data Set (Better for Demo):
- ✅ **8 Event Types**
- ✅ **20 Services** (Good variety)
- ✅ **15 Users** (Multiple clients)
- ✅ **30 Events** (Spread across past, present, future dates)
- ✅ **50+ Event-Service assignments**
- ✅ **20+ Payments**
- ✅ **Activity logs** from triggers

---

## 🚀 Quick Start Commands

```bash
# 1. Test connection
node test-db-connection.js

# 2. Insert all sample data
node insert-sample-data.js

# 3. Start the app
npm run dev

# 4. Login with
# Email: admin@rosewood.com
# Password: Admin123!
```

---

## 📊 Checking Data After Insert

Run this in MySQL Workbench:
```sql
-- Check all counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'event_types', COUNT(*) FROM event_types
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

-- View all users
SELECT user_id, email, full_name, role, status FROM users;

-- View all events
SELECT event_id, event_name, event_date, status FROM events;
```

---

## 🔐 Password Security Notes

- All passwords are hashed using bcrypt (10 rounds)
- Never store plain passwords in database
- The scripts automatically hash passwords before insert
- Default test passwords are simple for demo purposes
- In production, use strong passwords!

---

**Now tell me: What sample data do you want to create? I can help you customize the insert script!** 🎯
