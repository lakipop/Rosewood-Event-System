# 🚀 Database Installation Guide

This guide explains how to set up all the advanced database features for the Rosewood Event System.

## Prerequisites

- MySQL 8.0+ installed and running
- MySQL Workbench or MySQL CLI access
- Database `rosewood_events` already created
- Tables already created from `create_tables.sql`

## Installation Order

Execute these SQL files **in order** using MySQL Workbench:

### 1️⃣ Create Indexes (Performance)

**File:** `database/indexes/all_indexes.sql`

```sql
-- Open the file in MySQL Workbench and execute
-- This creates 30+ indexes for optimal query performance
```

**What it does:**
- Single-column indexes for frequent searches
- Composite indexes for complex queries
- Full-text indexes for searching text fields

---

### 2️⃣ Create Functions (Calculations)

**File:** `database/functions/all_functions.sql`

```sql
-- Execute in MySQL Workbench
-- Creates 7 user-defined functions
```

**Functions created:**
- `fn_calculate_event_cost()` - Calculate total service cost
- `fn_calculate_total_paid()` - Calculate total payments
- `fn_calculate_balance()` - Calculate remaining balance
- `fn_is_event_paid()` - Check if event is fully paid
- `fn_days_until_event()` - Days until event date
- `fn_format_phone()` - Format Sri Lankan phone numbers
- `fn_service_unit_total()` - Calculate service totals

---

### 3️⃣ Create Views (Reporting)

**File:** `database/views/all_views.sql`

```sql
-- Execute in MySQL Workbench
-- Creates 7 database views
```

**Views created:**
- `v_event_summary` - Complete event details with calculations
- `v_active_events` - Currently active events
- `v_upcoming_events` - Events in next 30 days
- `v_service_stats` - Service usage statistics
- `v_payment_summary` - Payment summaries by event
- `v_user_activity` - User activity tracking
- `v_monthly_revenue` - Monthly revenue reports

---

### 4️⃣ Create Stored Procedures (Complex Operations)

**File:** `database/procedures/all_procedures.sql`

```sql
-- Execute in MySQL Workbench
-- Creates 5 stored procedures
```

**Procedures created:**
- `sp_create_event()` - Create event with validation
- `sp_add_event_service()` - Add service to event
- `sp_process_payment()` - Process payment with validation
- `sp_update_event_status()` - Update status with logging
- `sp_get_event_summary()` - Get detailed event summary

---

### 5️⃣ Create Triggers (Automation)

**File:** `database/triggers/all_triggers.sql`

```sql
-- Execute in MySQL Workbench
-- Creates 8 triggers
```

**Triggers created:**
- `tr_after_payment_insert` - Log payment creation
- `tr_check_full_payment` - Auto-update status when fully paid
- `tr_after_event_insert` - Log event creation
- `tr_after_event_update` - Log status changes
- `tr_after_event_service_insert` - Log service additions
- `tr_before_event_delete` - Prevent deletion of paid events
- `tr_before_payment_insert` - Validate payment amounts
- `tr_before_event_update_timestamp` - Auto-update timestamps

---

## Verification

After installation, verify everything works:

### Check Functions

```sql
-- Test calculate event cost
SELECT fn_calculate_event_cost(1) as total_cost;

-- Test days until event
SELECT fn_days_until_event('2025-12-31') as days_remaining;
```

### Check Views

```sql
-- View event summaries
SELECT * FROM v_event_summary LIMIT 5;

-- View service statistics
SELECT * FROM v_service_stats;
```

### Check Procedures

```sql
-- Test get event summary
CALL sp_get_event_summary(1);
```

### Check Triggers

```sql
-- Insert a payment and check if activity log was created
INSERT INTO payments (event_id, amount, payment_method, payment_type, reference_number, status)
VALUES (1, 5000.00, 'cash', 'advance', 'TEST001', 'completed');

-- Check activity log
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
```

### Check Indexes

```sql
-- Show all indexes on events table
SHOW INDEX FROM events;

-- Show all indexes on payments table
SHOW INDEX FROM payments;
```

---

## Common Issues

### Issue: "Function already exists"

**Solution:** Drop the function first:

```sql
DROP FUNCTION IF EXISTS fn_calculate_event_cost;
-- Then re-run the function creation script
```

### Issue: "Trigger already exists"

**Solution:** Drop the trigger first:

```sql
DROP TRIGGER IF EXISTS tr_after_payment_insert;
-- Then re-run the trigger creation script
```

### Issue: "View already exists"

**Solution:** Views use `CREATE OR REPLACE`, so they should update automatically. If issues persist:

```sql
DROP VIEW IF EXISTS v_event_summary;
-- Then re-run the view creation script
```

---

## Testing with Sample Data

After installing all database features, populate with sample data:

```bash
# Run from project root
node insert-sample-data.js
```

This will insert:
- 10 users (with bcrypt passwords)
- 10 event types
- 10 services
- 10 events
- 10 event-service assignments
- 10 payments
- 10 activity logs

---

## Success! 🎉

You now have:
- ✅ 30+ Performance indexes
- ✅ 7 User-defined functions
- ✅ 7 Database views
- ✅ 5 Stored procedures
- ✅ 8 Automated triggers
- ✅ Sample data (100+ records)

Your database is now fully configured for the ADBMS project demonstration!

---

## Next Steps

1. Start the Nuxt development server: `npm run dev`
2. Login with test account: `kamal.peera@gmail.com` / `Test123`
3. Explore the dashboard and services page
4. Create new events and test the functionality
5. Check `activity_logs` table to see trigger automation
6. Query views to see reporting capabilities
