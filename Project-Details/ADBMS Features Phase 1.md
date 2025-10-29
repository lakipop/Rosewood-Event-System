# Phase 1 - ADBMS Feature Implementation

**Date:** October 12, 2025  
**Status:** ✅ COMPLETE

This document describes all ADBMS features used in Phase 1 implementation, organized by page/feature.

---

---

## 1️⃣ EVENT LIST PAGE

### Frontend File

- **File:** `pages/events/index.vue`
- **Route:** `/events`

### Backend API

- **File:** `server/api/events/index.get.ts`
- **Method:** GET `/api/events`

### ADBMS Features Used

#### Views (1)

**1. `v_event_summary`** - Main view for event list

```sql
-- Provides pre-calculated financial data for each event
SELECT event_id, event_name, event_date, venue, status, client_name,
       total_cost, total_paid, balance
FROM v_event_summary
```

- **Why:** Eliminates need for complex JOINs in application code
- **Advantage:** Pre-aggregated financial calculations (total_cost, total_paid, balance) improve performance
- **Joins Inside View:**
  - `events` JOIN `event_types` (get event type name)
  - `events` JOIN `users` (get client information)
  - `events` LEFT JOIN `event_services` (calculate total cost)
  - Subquery to `payments` table (calculate total paid)

#### Functions (2)

**1. `fn_payment_status(event_id)`** - Returns payment status text

```sql
fn_payment_status(vs.event_id) as payment_status
-- Returns: 'Fully Paid', 'Partially Paid', 'Unpaid'
```

- **Why:** Consistent payment status logic across application
- **Advantage:** Database-level business logic, no code duplication

**2. `fn_days_until_event(event_id)`** - Calculates days until event

```sql
fn_days_until_event(vs.event_id) as days_until_event
-- Returns: Number of days (negative if past)
```

- **Why:** Centralized date calculation
- **Advantage:** Accurate date math, timezone handling in database

#### Indexes Supporting This Page

```sql
-- Optimizes event listing queries
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_date_status ON events(event_date, status);
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_client_status ON events(client_id, status);

-- Optimizes search functionality
CREATE FULLTEXT INDEX idx_events_search ON events(event_name, venue);
CREATE FULLTEXT INDEX idx_users_search ON users(full_name, email);
```

- **idx_events_status:** Fast filtering by status (inquiry, confirmed, etc.)
- **idx_events_event_date:** Fast sorting by date, date range filtering
- **idx_events_date_status:** Composite index for combined date + status filters
- **idx_events_client_status:** Fast filtering for client-specific event lists
- **idx_events_search:** Full-text search on event names and venues

#### Query Execution Flow

1. **Query v_event_summary view** → Uses indexes on base tables (events, event_services)
2. **Call fn_payment_status()** → Uses idx_payments_event_status
3. **Call fn_days_until_event()** → Uses idx_events_event_date
4. **Apply filters** → Uses idx_events_date_status, idx_events_client_status
5. **Search** → Uses idx_events_search full-text index
6. **Stats calculation** → Uses idx_events_status for fast counting

---

## 2️⃣ CREATE EVENT PAGE

### Frontend File

- **File:** `pages/events/create.vue`
- **Route:** `/events/create`

### Backend API

- **File:** `server/api/events/index.post.ts`
- **Method:** POST `/api/events`

### ADBMS Features Used

#### Stored Procedures (1)

**1. `sp_create_event()`** - Creates event with validation

```sql
CALL sp_create_event(
  client_id, event_type_id, event_name, event_date, 
  event_time, venue, guest_count, budget,
  @event_id, @message
)
```

**Validations Inside Procedure:**

- Client must exist and be active
- Event type must exist and be active
- Event date cannot be in the past
- Guest count must be positive
- Budget must be non-negative

**Why:** Centralized business logic and validation
**Advantage:**

- Consistent validation across all interfaces
- Database enforces business rules
- Prevents invalid data at database level
- Reduces application code complexity

#### Triggers Activated (1)

**1. `tr_after_event_insert`** - Auto-logs event creation

```sql
-- Automatically fires after INSERT on events table
-- Inserts record into activity_logs table
INSERT INTO activity_logs (user_id, action_type, table_name, record_id, description)
```

**Why:** Automatic audit trail
**Advantage:**

- No application code needed for logging
- Cannot be bypassed
- Consistent logging format

#### Views (1)

**1. `v_event_summary`** - Returns created event data

```sql
SELECT * FROM v_event_summary WHERE event_id = ?
```

**Why:** Return complete event information including calculated fields
**Advantage:** Consistent data structure for frontend

#### Indexes Supporting This Page

```sql
-- Validates client exists and is active
CREATE INDEX idx_users_role_status ON users(role, status);

-- Validates event type exists and is active
CREATE INDEX idx_event_types_is_active ON event_types(is_active);

-- Fast retrieval of newly created event
CREATE INDEX idx_events_client_id ON events(client_id);
```

#### Query Execution Flow

1. **Call sp_create_event()** → Validates client + event type using idx_users_role_status, idx_event_types_is_active
2. **Procedure validation** → Returns @event_id and @message (error handling inside procedure)
3. **Trigger: tr_after_event_insert** → Auto-logs activity after successful insert
4. **Query v_event_summary** → Uses idx_events_client_id to return created event

#### Error Handling (ADBMS Level)

**Stored Procedure `sp_create_event` handles:**

- Returns `@event_id = 0` and error message if validation fails
- Client not found or inactive
- Event type not found or inactive
- Invalid date (past date)
- Invalid guest count or budget

**Why:** Database-level error handling ensures validation cannot be bypassed

---

## 3️⃣ EVENT DETAILS PAGE

### Frontend File

- **File:** `pages/events/[id].vue`
- **Route:** `/events/:id`

### Backend API

- **File:** `server/api/events/[id].get.ts`
- **Method:** GET `/api/events/:id`

### ADBMS Features Used

#### Stored Procedures (1)

**1. `sp_get_event_summary(event_id)`** - Validates and prepares event data

```sql
CALL sp_get_event_summary(?)
```

**What It Does:**

- Validates event exists
- Prepares comprehensive event summary
- Aggregates related data

**Why:** Centralized data retrieval logic
**Advantage:** Optimized query execution plan, consistent data structure

#### Views (3)

**1. `v_event_summary`** - Main event information

```sql
SELECT * FROM v_event_summary WHERE event_id = ?
```

**Joins Inside:**

- events → event_types (get type name)
- events → users (get client info)
- events ← event_services (calculate total_cost)
- events ← payments (calculate total_paid, balance)

**2. `v_payment_summary`** - Payment history with details

```sql
SELECT * FROM v_payment_summary WHERE event_id = ?
```

**Joins Inside:**

- payments → events (event details)
- payments → users (who processed payment)

**3. `v_user_activity`** - Activity log for event

```sql
SELECT * FROM v_user_activity 
WHERE table_name = 'events' AND record_id = ?
ORDER BY created_at DESC LIMIT 10
```

**Joins Inside:**

- activity_logs → users (get user who performed action)

#### Functions (6)

**1. `fn_calculate_event_cost(event_id)`** - Total service cost

```sql
SELECT fn_calculate_event_cost(?) as total_cost
-- SUM(quantity * agreed_price) from event_services
```

**2. `fn_calculate_total_paid(event_id)`** - Total payments received

```sql
SELECT fn_calculate_total_paid(?) as total_paid
-- SUM(amount) from payments WHERE status = 'completed'
```

**3. `fn_calculate_balance(event_id)`** - Remaining balance

```sql
SELECT fn_calculate_balance(?) as balance
-- total_cost - total_paid
```

**4. `fn_is_event_paid(event_id)`** - Boolean paid status

```sql
SELECT fn_is_event_paid(?) as is_paid
-- Returns TRUE if balance = 0
```

**5. `fn_payment_status(event_id)`** - Status text

```sql
SELECT fn_payment_status(?) as payment_status
-- Returns: 'Fully Paid', 'Partially Paid', 'Unpaid'
```

**6. `fn_days_until_event(event_id)`** - Days countdown

```sql
SELECT fn_days_until_event(?) as days_until
-- DATEDIFF(event_date, CURDATE())
```

**Why Use Functions:**

- Consistent calculation logic across application
- Database-level computation (faster than application)
- Reusable in multiple queries and reports
- Single source of truth for business calculations

#### Indexes Supporting This Page

```sql
-- Fast event lookup by ID (Primary Key)
PRIMARY KEY (event_id)

-- Fast service retrieval for event
CREATE INDEX idx_event_services_event_id ON event_services(event_id);
CREATE INDEX idx_event_services_event_status ON event_services(event_id, status);

-- Fast payment retrieval for event
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_event_status ON payments(event_id, status);

-- Fast activity log retrieval
CREATE INDEX idx_activity_logs_table_name ON activity_logs(table_name);
-- Composite index for filtering by table and record
```

#### Query Execution Flow

1. **Call sp_get_event_summary()** → Validates event, uses PK lookup
2. **Query v_event_summary** → Uses pre-aggregated data from view
3. **Call 6 financial functions** → Execute in parallel, use idx_payments_event_status, idx_event_services_event_status
4. **Query services** → Uses idx_event_services_event_id
5. **Query v_payment_summary** → Uses idx_payments_event_id
6. **Query v_user_activity** → Uses idx_activity_logs_table_name

#### Error Handling (ADBMS Level)

**Stored Procedure `sp_get_event_summary` handles:**

- Validates event exists
- Returns error message if event not found

**Functions return NULL-safe values:**

- `fn_calculate_event_cost()` → Returns 0 if no services
- `fn_calculate_total_paid()` → Returns 0 if no payments
- `fn_calculate_balance()` → Uses COALESCE for NULL handling

**Why:** Database functions handle edge cases (NULL values, missing data) automatically

---

## 4️⃣ ADD SERVICE TO EVENT

### Backend API

- **File:** `server/api/events/[id]/services.post.ts`
- **Method:** POST `/api/events/:id/services`

### ADBMS Features Used

#### Stored Procedures (1)

**1. `sp_add_event_service(event_id, service_id, quantity, agreed_price)`**

```sql
CALL sp_add_event_service(?, ?, ?, ?, @success, @message)
```

**Validations Inside Procedure:**

- Event must exist and not be cancelled
- Service must exist and be active (is_available = TRUE)
- Service not already added to this event
- Quantity must be positive
- Agreed price must be positive

**Why:** Complex validation and business rules
**Advantage:**

- Prevents duplicate services
- Enforces data integrity
- Consistent validation logic
- Atomic operation (transaction handling)

#### Triggers Activated (2)

**1. `tr_after_service_add`** - Auto-logs service addition

```sql
-- Fires after INSERT on event_services
-- Logs: "Added service [service_name] to event [event_name]"
```

**2. `tr_budget_overrun_warning`** - Budget validation

```sql
-- Fires after INSERT/UPDATE on event_services
-- Checks if total_cost > budget
-- Inserts warning into activity_logs if over budget
```

**Why:** Proactive budget monitoring
**Advantage:**

- Real-time budget alerts
- Automatic without application code
- Cannot be bypassed

#### Indexes Supporting This Feature

```sql
-- Validates service exists and is available
CREATE INDEX idx_services_is_available ON services(is_available);

-- Checks for duplicate service
CREATE INDEX idx_event_services_event_status ON event_services(event_id, status);

-- Fast service list retrieval
CREATE INDEX idx_event_services_event_id ON event_services(event_id);
```

#### Query Execution Flow

1. **Call sp_add_event_service()** → Validates event + service using indexes
2. **Procedure checks duplicate** → Uses idx_event_services_event_status
3. **Trigger: tr_after_service_add** → Auto-logs service addition
4. **Trigger: tr_budget_overrun_warning** → Checks if over budget, logs warning
5. **Retrieve added service** → Uses idx_event_services_event_id + JOIN with services table

#### Error Handling (ADBMS Level)

**Stored Procedure `sp_add_event_service` handles:**

- Returns `@success = FALSE` and error message if validation fails
- Event not found or cancelled
- Service not found or unavailable
- Duplicate service already added
- Invalid quantity or price

**Trigger `tr_budget_overrun_warning` handles:**

- Automatically logs warning if total_cost > budget
- No manual checking needed

**Why:** Database-level validation and automatic warnings

---

## 5️⃣ PROCESS PAYMENT

### Backend API

- **File:** `server/api/payments/index.post.ts`
- **Method:** POST `/api/payments`

### ADBMS Features Used

#### Stored Procedures (1)

**1. `sp_process_payment(event_id, amount, payment_method, payment_type, reference_number)`**

```sql
CALL sp_process_payment(?, ?, ?, ?, ?, @payment_id, @message)
```

**Validations Inside Procedure:**

- Event must exist and not be cancelled
- Amount must be positive
- Payment method must be valid (cash, card, bank_transfer, etc.)
- Prevents overpayment (amount > remaining balance)

**Why:** Complex payment validation
**Advantage:**

- Prevents invalid payments
- Ensures data integrity
- Handles edge cases (overpayment)
- Transaction safety

#### Triggers Activated (3)

**1. `tr_after_payment_insert`** - Auto-logs payment

```sql
-- Fires after INSERT on payments
-- Logs: "Payment of [amount] received for event [event_name]"
```

**2. `tr_update_event_status_on_payment`** - Auto-confirm event

```sql
-- Fires after INSERT on payments
-- Checks if event is fully paid
-- Updates event.status = 'confirmed' if balance = 0
```

**Why:** Automatic status updates
**Advantage:**

- No manual status tracking needed
- Real-time status updates
- Business rule enforced at database level

**3. `tr_generate_payment_reference`** - Auto-generate reference

```sql
-- Fires BEFORE INSERT on payments
-- If reference_number IS NULL
-- Generates: 'PAY-[event_id]-[timestamp]'
```

**Why:** Unique payment tracking
**Advantage:**

- Every payment has reference number
- Automatic generation
- Consistent format

#### Views (1)

**1. `v_payment_summary`** - Returns payment details

```sql
SELECT * FROM v_payment_summary WHERE payment_id = ?
```

**Joins Inside:**

- payments → events (event details)
- payments → users (client info)

**Why:** Structured payment data
**Advantage:** Includes related event and client information

#### Indexes Supporting This Feature

```sql
-- Validates event exists
CREATE INDEX idx_events_status ON events(status);

-- Fast payment retrieval
CREATE INDEX idx_payments_event_id ON payments(event_id);
CREATE INDEX idx_payments_event_status ON payments(event_id, status);

-- Payment history queries
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_date_status ON payments(payment_date, status);
```

#### Query Execution Flow

1. **Validate event** → Uses PK lookup + idx_events_status
2. **Call sp_process_payment()** → Validates and inserts
3. **Trigger: tr_generate_payment_reference** → Fires BEFORE INSERT
4. **Trigger: tr_after_payment_insert** → Fires AFTER INSERT (logs activity)

#### Query Execution Flow

1. **Validate event** → Uses PK lookup + idx_events_status
2. **Call sp_process_payment()** → Validates and inserts
3. **Trigger: tr_generate_payment_reference** → Fires BEFORE INSERT (auto-generates reference if NULL)
4. **Trigger: tr_after_payment_insert** → Fires AFTER INSERT (logs activity)
5. **Trigger: tr_update_event_status_on_payment** → Fires AFTER INSERT (checks balance, auto-confirms if fully paid)
6. **Query v_payment_summary** → Uses idx_payments_event_id to retrieve payment details

#### Error Handling (ADBMS Level)

**Stored Procedure `sp_process_payment` handles:**

- Returns `@payment_id = NULL` and error message if validation fails
- Event not found or cancelled
- Invalid payment amount (negative or zero)
- Overpayment prevention (amount > remaining balance)
- Invalid payment method

**Triggers handle automatic operations:**

- `tr_generate_payment_reference`: Auto-generates reference if not provided
- `tr_update_event_status_on_payment`: Auto-confirms event when fully paid

**Why:** Database-level payment validation prevents invalid transactions

---`sp_create_event` - Event creation with validation
2. `sp_get_event_summary` - Event data retrieval
3. `sp_add_event_service` - Service addition with validation
4. `sp_process_payment` - Payment processing with validation

**Benefits:**

- Centralized business logic
- Consistent validation across application
- Better performance (reduced network calls)
- Database-enforced data integrity

### Functions Used: 6

1. `fn_calculate_event_cost` - Sum of service costs
2. `fn_calculate_total_paid` - Sum of payments
3. `fn_calculate_balance` - Cost minus paid
4. `fn_is_event_paid` - Boolean paid status
5. `fn_payment_status` - Status text (Fully Paid/Partially Paid/Unpaid)
6. `fn_days_until_event` - Days countdown to event

**Benefits:**

- Reusable calculations
- Single source of truth
- Database-level computation (faster)
- Consistent logic across queries and reports

### Views Used: 3

1. `v_event_summary` - Events with financial calculations and JOINs
2. `v_payment_summary` - Payments with event/client details
3. `v_user_activity` - Activity logs with user details

**Views with JOINs:**

- `v_event_summary`: events → event_types, events → users, events ← event_services, events ← payments
- `v_payment_summary`: payments → events, payments → users
- `v_user_activity`: activity_logs → users

**Benefits:**

- Eliminates complex JOINs in application code
- Pre-aggregated data (faster queries)
- Consistent data structure
- Simplifies frontend code

### Triggers Used: 6

1. `tr_after_event_insert` - Auto-log event creation
2. `tr_after_service_add` - Auto-log service addition
3. `tr_budget_overrun_warning` - Alert when over budget
4. `tr_after_payment_insert` - Auto-log payment
5. `tr_update_event_status_on_payment` - Auto-confirm when fully paid
6. `tr_generate_payment_reference` - Auto-generate payment reference

**Benefits:**

- Automatic operations without application code
- Cannot be bypassed
- Consistent behavior
- Real-time updates

### Indexes Used: 24

**Performance optimization for:**

- Primary key lookups (event_id, payment_id, service_id)
- Foreign key lookups (client_id, event_type_id)
- Status filtering (status columns)
- Date filtering and sorting (event_date, payment_date)
- Composite indexes for combined filters
- Full-text search (event_name, venue, user names)

**Benefits:**

- Fast query execution
- Efficient filtering and sorting
- Optimized JOIN operations
- Reduced database load

---

## 🎯 Why ADBMS Features Matter

### 1. **Performance**

- Views pre-calculate complex aggregations
- Indexes speed up queries (10-100x faster)
- Functions execute at database level (faster than application)
- Procedures reduce network round-trips

### 2. **Data Integrity**

- Procedures enforce business rules
- Triggers ensure consistency
- Database-level validation prevents bad data
- Cannot be bypassed

### 3. **Maintainability**

- Business logic in one place (database)
- No code duplication across application
- Single source of truth
- Easier to update logic

### 4. **Reliability**

- Triggers auto-execute (no forgotten operations)
- Consistent behavior across all clients
- Automatic audit trails
- Error prevention at database level

---
**ADBMS Features:** 19 Used
