# 🎯 ADBMS Features Used By Page

## 📊 Quick Overview

This document shows you exactly which ADBMS features (stored procedures, functions, views, triggers) are used on each page of our event management system. Perfect for presentations and understanding how database features support the application.

---

## 🏠 1. DASHBOARD PAGE
**Route:** `/`  
**File:** `pages/index.vue`  
**Purpose:** Main landing page showing business overview and quick stats

### What Users See:
- Total events count (inquiry, confirmed, in progress)
- Total clients registered
- This month's revenue
- Upcoming events (next 7 days) with alerts
- Recent event bookings
- Top performing services

### ADBMS Features Used (8 features):

#### 📈 Views (3):
1. **`v_upcoming_events`** - Shows events happening in next 30 days
   - Why: Proactive alerts for event managers
   - Shows: Event name, date, venue, days until event, payment status
   
2. **`v_event_summary`** - Event list with financial calculations
   - Why: Quick overview with pre-calculated costs
   - Shows: Total cost, payments, balance for each event
   
3. **`v_monthly_revenue`** - Revenue breakdown by month
   - Why: Track business performance trends
   - Shows: Total revenue, transaction counts, payment methods

#### 🔧 Functions (1):
1. **`fn_payment_status(event_id)`** - Returns payment status text
   - Returns: "Fully Paid", "Partially Paid", or "Unpaid"
   - Why: Consistent status display across dashboard

#### 📡 Backend API:
- `server/api/dashboard/stats.get.ts` - Aggregates all dashboard data
- `server/api/upcoming-events.get.ts` - Gets alert widget data

**User Experience:** Dashboard loads fast because views pre-calculate complex numbers. Upcoming events widget helps staff stay prepared.

---

## 🔐 2. LOGIN & REGISTER PAGES
**Routes:** `/auth/login` and `/auth/register`  
**Files:** `pages/auth/login.vue`, `pages/auth/register.vue`  
**Purpose:** User authentication and new account creation

### What Users See:
- Modern glass morphism login form
- Email and password fields
- Registration form with role selection
- Success/error messages

### ADBMS Features Used (2 features):

#### ⚡ Triggers (2):
1. **`tr_after_user_insert`** - Automatic activity logging (implicit)
   - Fires: When new user registers
   - Action: Logs "User created" to activity_logs table
   - Why: Security audit trail, track all user creations

2. **Direct table access to `users` table with indexes**
   - `idx_users_email` - Fast email lookup for login
   - `idx_users_role` - Filter by role (admin, manager, client)
   - Why: Quick authentication checks

#### 📡 Backend API:
- `server/api/auth/login.post.ts` - Validates credentials, generates JWT
- `server/api/auth/register.post.ts` - Creates new user account

**User Experience:** Fast login because email index allows instant lookups. All user registrations are automatically logged for security.

---

## 📅 3. EVENTS LIST PAGE
**Route:** `/events`  
**File:** `pages/events/index.vue`  
**Purpose:** Browse and search all events

### What Users See:
- Searchable list of all events
- Filter by status (inquiry, confirmed, in progress, completed, cancelled)
- Sort by date, status, client name
- Event cards showing: name, date, venue, client, payment status, days until event
- Quick stats: total events, by status

### ADBMS Features Used (7 features):

#### 📈 Views (1):
1. **`v_event_summary`** - Main event data with calculations
   - Joins: events + event_types + users + event_services + payments
   - Calculations: total_cost (SUM of services), total_paid, balance
   - Why: One view handles 5 table joins and 3 calculations
   - Performance: Pre-optimized query plan

#### 🔧 Functions (2):
1. **`fn_payment_status(event_id)`** - Payment status badge
   - Logic: Compares total_paid vs total_cost
   - Returns: "Fully Paid" (green), "Partially Paid" (yellow), "Unpaid" (red)
   
2. **`fn_days_until_event(event_id)`** - Countdown to event
   - Calculation: DATEDIFF(event_date, CURDATE())
   - Returns: Positive = future, Negative = past
   - Why: Accurate date math at database level

#### 🗂️ Indexes (4):
1. **`idx_events_status`** - Fast filtering by event status
2. **`idx_events_event_date`** - Quick sorting by date
3. **`idx_events_date_status`** - Combined date + status filters
4. **`idx_events_search`** - Full-text search on event names & venues

#### 📡 Backend API:
- `server/api/events/index.get.ts` - Fetches event list with filters

**User Experience:** Smooth scrolling through hundreds of events because indexes speed up queries 10-100x. Search is instant with full-text index.

---

## ✏️ 4. CREATE EVENT PAGE
**Route:** `/events/create`  
**File:** `pages/events/create.vue`  
**Purpose:** Book a new event for a client

### What Users See:
- Form with fields: client, event type, name, date, time, venue, guest count, budget
- Dropdown to select existing client
- Calendar date picker
- Submit button

### ADBMS Features Used (4 features):

#### 📊 Stored Procedures (1):
1. **`sp_create_event(...)`** - Creates event with validation
   - **Validates:**
     - Client exists and is active
     - Event type is valid
     - Date is not in the past
     - Guest count > 0
     - Budget >= 0
   - **Returns:** New event_id and success message
   - **Why:** All business rules enforced at database level
   - **Benefit:** Prevents invalid data, consistent validation

#### ⚡ Triggers (2):
1. **`tr_after_event_insert`** - Auto-logs event creation
   - Fires: Immediately after event INSERT
   - Logs: "Event created: {name}, Date: {date}"
   - Why: Automatic audit trail, can't be forgotten

2. **`tr_before_event_insert`** - Sets default status
   - Fires: Before INSERT
   - Action: Sets status = 'inquiry' if not specified
   - Why: Ensures all new events start in inquiry phase

#### 📈 Views (1):
1. **`v_event_summary`** - Returns created event data
   - Used: To show success confirmation to user
   - Shows: All event details including calculated fields

#### 📡 Backend API:
- `server/api/events/index.post.ts` - Calls stored procedure, returns new event

**User Experience:** Form validation happens at database level, so data is always clean. Event is logged automatically, managers can track who created what.

---

## 📋 5. EVENT DETAILS PAGE
**Route:** `/events/{id}`  
**File:** `pages/events/[id].vue`  
**Purpose:** View complete event information, manage services, process payments

### What Users See:
- Event header: name, date, time, venue, status badge
- Client information panel
- Financial summary: total cost, paid amount, balance
- Payment status badge
- Days until event countdown
- Services list (what's included in the event)
- Payment history table
- Recent activity log
- Status update dropdown

### ADBMS Features Used (14 features):

#### 📊 Stored Procedures (1):
1. **`sp_get_event_summary(event_id)`** - Validates & loads event
   - Validates: Event exists
   - Returns: Comprehensive event data
   - Why: Optimized single query for all event info

#### 📈 Views (3):
1. **`v_event_summary`** - Main event data
   - Pre-joins: events + event_types + users + services + payments
   
2. **`v_payment_summary`** - Payment history
   - Shows: All payments for this event with client info
   - Sorted: Most recent first
   
3. **`v_user_activity`** - Activity log
   - Filters: Only actions for this event (table_name='events', record_id=event_id)
   - Shows: Who did what and when

#### 🔧 Functions (6):
1. **`fn_calculate_event_cost(event_id)`**
   - Calculates: SUM(quantity × agreed_price) from event_services
   - Used: Total cost display
   
2. **`fn_calculate_total_paid(event_id)`**
   - Calculates: SUM(amount) from payments WHERE status='completed'
   - Used: Payment progress tracking
   
3. **`fn_calculate_balance(event_id)`**
   - Calculates: total_cost - total_paid
   - Returns: Remaining amount due
   
4. **`fn_is_event_paid(event_id)`**
   - Returns: TRUE if balance = 0, else FALSE
   - Used: Show "Paid in Full" badge
   
5. **`fn_payment_status(event_id)`**
   - Returns: "Fully Paid", "Partially Paid", "Unpaid"
   - Used: Color-coded status badge
   
6. **`fn_days_until_event(event_id)`**
   - Calculates: Days until event date
   - Used: Countdown timer, urgency indicator

#### 🗂️ Indexes (4):
1. **`idx_payments_event_id`** - Fast payment lookup
2. **`idx_event_services_event_id`** - Fast service lookup
3. **`idx_activity_logs_record_id`** - Fast activity log filtering
4. **`idx_activity_logs_table_record`** - Combined filter for activity logs

#### 📡 Backend API:
- `server/api/events/[id].get.ts` - Loads all event details

**User Experience:** Page loads all data in one optimized query. Financial calculations update in real-time. Activity log shows complete audit trail.

---

## 🎨 6. ADD SERVICE TO EVENT
**Feature on Event Details Page**  
**Purpose:** Add catering, decoration, photography etc. to an event

### What Users See:
- "Add Service" button on event details page
- Modal with service dropdown, quantity, agreed price fields
- Service catalog to choose from
- Submit to add service

### ADBMS Features Used (5 features):

#### 📊 Stored Procedures (1):
1. **`sp_add_event_service(event_id, service_id, quantity, price)`**
   - **Validates:**
     - Event exists and not cancelled
     - Service exists and is available
     - Service not already added to event
     - Quantity > 0, Price > 0
   - **Returns:** Success flag and message
   - **Why:** Complex validation logic in one place

#### ⚡ Triggers (3):
1. **`tr_after_service_add`** - Logs service addition
   - Logs: "Service added: {service_name}, Qty: {quantity}"
   
2. **`tr_budget_overrun_warning`** - Checks budget
   - Fires: After service added
   - Action: If total_cost > budget, logs warning
   - Why: Alert managers to budget issues automatically
   
3. **`tr_update_event_financial_summary`** - Updates totals
   - Recalculates: Event total cost
   - Why: Keep financial data in sync

#### 🗂️ Indexes (1):
1. **`idx_event_services_event_service`** - Prevents duplicate services
   - Type: Unique index on (event_id, service_id)
   - Why: One service can't be added twice

#### 📡 Backend API:
- `server/api/events/[id]/services.post.ts` - Calls stored procedure

**User Experience:** Can't add invalid services or exceed budget without warning. All additions are logged automatically.

---

## 💰 7. PROCESS PAYMENT PAGE
**Feature on Event Details Page**  
**Purpose:** Record payment received from client

### What Users See:
- "Add Payment" button
- Modal with: amount, payment method (cash/card/bank), payment type (deposit/partial/final)
- Optional reference number field
- Submit to process payment

### ADBMS Features Used (7 features):

#### 📊 Stored Procedures (1):
1. **`sp_process_payment(event_id, amount, method, type, reference)`**
   - **Validates:**
     - Event exists
     - Amount > 0
     - Payment doesn't exceed balance
     - Valid payment method
   - **Inserts:** Payment record
   - **Returns:** payment_id and confirmation
   - **Why:** Transaction safety, atomic operation

#### ⚡ Triggers (4):
1. **`tr_before_payment_insert`** - Validates amount > 0
   - Blocks: Negative or zero payments
   
2. **`tr_generate_payment_reference`** - Auto-generates reference
   - Format: PAY-20251024-00123-ABC123
   - Fires: If reference_number is empty
   
3. **`tr_after_payment_insert`** - Logs payment
   - Logs: "Payment received: {amount}, Method: {method}"
   
4. **`tr_update_event_status_on_payment`** - Auto-confirm event
   - Logic: If total_paid >= total_cost, change status to 'confirmed'
   - Why: Automatically move paid events to confirmed

#### 📈 Views (1):
1. **`v_payment_summary`** - Returns payment record
   - Used: Show confirmation details to user

#### 🗂️ Indexes (1):
1. **`idx_payments_event_status`** - Fast payment queries

#### 📡 Backend API:
- `server/api/payments/index.post.ts` - Processes payment via stored procedure

**User Experience:** Reference numbers are generated automatically. When event is fully paid, status changes to "confirmed" instantly. All payments logged.

---

## 💳 8. PAYMENTS LIST PAGE
**Route:** `/payments`  
**File:** `pages/payments/index.vue`  
**Purpose:** View all payments across all events

### What Users See:
- Table of all payments
- Columns: Date, Event, Client, Amount, Method, Type, Status, Reference
- Filter by: payment method, status, date range
- Search by: event name, client name, reference number
- Summary stats: total collected, by method

### ADBMS Features Used (4 features):

#### 📈 Views (1):
1. **`v_payment_summary`** - Pre-joined payment data
   - Joins: payments + events + users (clients)
   - Why: Shows payment with event and client info in one query
   - Sorted: Most recent payments first

#### 🗂️ Indexes (3):
1. **`idx_payments_date`** - Fast date range filtering
2. **`idx_payments_method`** - Filter by payment method
3. **`idx_payments_status`** - Filter by status (completed/pending)

#### 📡 Backend API:
- `server/api/payments/index.get.ts` - Uses v_payment_summary view

**User Experience:** Fast loading of payment history. Can quickly find payments by date or client name.

---

## 👥 9. USER MANAGEMENT PAGE
**Route:** `/users`  
**File:** `pages/users/index.vue`  
**Purpose:** Admin-only page to manage user accounts

### What Users See:
- Table of all users (admins, managers, clients)
- Columns: Name, Email, Phone, Role, Status, Registration Date
- Filter by: role, status
- Search by: name, email
- Actions: Create, Edit, Delete users
- Role statistics

### ADBMS Features Used (5 features):

#### Direct Table Access:
1. **`users` table with indexes**
   - Simple CRUD operations don't need views
   - Direct queries are more efficient for admin actions

#### 🗂️ Indexes (5):
1. **`idx_users_role`** - Filter by role (admin/manager/client)
2. **`idx_users_status`** - Filter by status (active/inactive)
3. **`idx_users_role_status`** - Combined role + status filter
4. **`idx_users_email`** - Unique email constraint, fast lookup
5. **`idx_users_search`** - Full-text search on names and emails

#### Aggregation Queries:
```sql
-- Role statistics
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
```

#### 📡 Backend API:
- `server/api/users/index.get.ts` - List users
- `server/api/users/index.post.ts` - Create user
- `server/api/users/[id].put.ts` - Update user
- `server/api/users/[id].delete.ts` - Delete user

**User Experience:** Fast user search with full-text index. Role-based filtering is instant with indexes.

---

## 📊 10. REVENUE TRENDS REPORT
**Route:** `/reports/revenue-trends`  
**File:** `pages/reports/revenue-trends.vue`  
**Purpose:** Analyze monthly revenue patterns and growth

### What Users See:
- Line chart of monthly revenue
- Growth percentage month-over-month
- Revenue comparison table
- Cumulative revenue tracking
- Transaction counts per month

### ADBMS Features Used (3 features):

#### 📈 Views (1):
1. **`v_revenue_trends`** - Advanced revenue analytics
   - **Window Functions Used:**
     - `LAG()` - Gets previous month's revenue
     - `SUM() OVER()` - Calculates cumulative revenue
   - **Calculations:**
     - Revenue change = current - previous
     - Growth % = (change / previous) × 100
     - Running total across months
   - **Why:** Complex time-series analysis in one view
   - **ADBMS Feature:** Window functions are advanced SQL

#### 🗂️ Indexes (2):
1. **`idx_payments_date`** - Fast date grouping
2. **`idx_payments_status`** - Filter completed payments

#### 📡 Backend API:
- `server/api/reports/revenue-trends.get.ts` - Fetches from v_revenue_trends

**User Experience:** Beautiful revenue charts load instantly. Growth trends calculated automatically by database.

---

## 📈 11. SERVICE PROFITABILITY REPORT
**Route:** `/reports/service-profitability`  
**File:** `pages/reports/service-profitability.vue`  
**Purpose:** Which services make the most money?

### What Users See:
- Table of all services with profitability metrics
- Columns: Service Name, Bookings, Quantity Sold, Revenue, Cost, Profit, Margin%
- Sort by: most profitable, most booked, highest margin
- Bar charts showing profit comparison

### ADBMS Features Used (2 features):

#### 📈 Views (1):
1. **`v_service_profitability`** - Advanced service analytics
   - **CTEs (Common Table Expressions) Used:**
     - `service_costs` CTE - Calculates estimated cost (70% of price)
     - `service_bookings` CTE - Aggregates booking data
   - **Calculations:**
     - Estimated profit = revenue - (cost × quantity)
     - Profit margin % = (profit / revenue) × 100
   - **Why:** Break complex query into understandable parts
   - **ADBMS Feature:** CTEs are advanced SQL technique

#### 🗂️ Indexes (1):
1. **`idx_event_services_service`** - Fast service aggregation

#### 📡 Backend API:
- `server/api/reports/service-profitability.get.ts` - Uses view with CTEs

**User Experience:** Instantly see which services are profitable. Helps managers decide pricing and focus areas.

---

## 👥 12. CLIENT SEGMENTS REPORT
**Route:** `/reports/client-segments`  
**File:** `pages/reports/client-segments.vue`  
**Purpose:** Categorize clients by spending and activity

### What Users See:
- Table of clients with segments
- Segments: VIP ($100k+), Premium ($50k+), Regular ($20k+), New, Prospect
- Engagement status: Active, At Risk, Inactive
- Metrics: Total events, lifetime value, last event date
- Filter by segment and engagement status

### ADBMS Features Used (2 features):

#### 📈 Views (1):
1. **`v_client_segments`** - Advanced client analytics
   - **CASE Statements for Segmentation:**
     ```sql
     CASE 
       WHEN lifetime_value >= 100000 THEN 'VIP'
       WHEN lifetime_value >= 50000 THEN 'Premium'
       WHEN lifetime_value >= 20000 THEN 'Regular'
       ELSE 'New'
     END as client_segment
     ```
   - **Date Logic for Engagement:**
     ```sql
     CASE 
       WHEN days_since_last_event <= 90 THEN 'Active'
       WHEN days_since_last_event <= 365 THEN 'At Risk'
       ELSE 'Inactive'
     END
     ```
   - **Aggregations:** COUNT(events), SUM(payments), MAX(date)
   - **Why:** Complex business logic in SQL, not application code

#### 🗂️ Indexes (1):
1. **`idx_users_role`** - Filter clients only

#### 📡 Backend API:
- `server/api/reports/client-segments.get.ts` - Fetches segmented clients

**User Experience:** Automatically categorize clients for targeted marketing. Identify at-risk clients to re-engage.

---

## 📜 13. ACTIVITY LOGS PAGE
**Route:** `/activity-logs`  
**File:** `pages/activity-logs.vue`  
**Purpose:** Security audit trail of all system actions

### What Users See:
- Complete log of all system activities
- Columns: Date/Time, User, Action, Table, Record ID, Description
- Filter by: action type (INSERT/UPDATE/DELETE), table name, date range
- Search by: user name, description
- Statistics: total activities, by action type

### ADBMS Features Used (3 features):

#### 📈 Views (1):
1. **`v_user_activity`** - Activity logs with user details
   - Joins: activity_logs + users
   - Generated description: "John Doe performed UPDATE on events (ID: 123)"
   - Why: Human-readable activity descriptions

#### ⚡ Triggers (All 11 triggers contribute):
All these triggers auto-log activities:
1. `tr_after_payment_insert` - Logs payment creation
2. `tr_after_payment_update` - Logs payment changes
3. `tr_after_event_insert` - Logs event creation
4. `tr_after_event_status_update` - Logs status changes
5. `tr_after_service_add` - Logs service additions
6. `tr_cascade_event_cancellation` - Logs cancellations
7. `tr_budget_overrun_warning` - Logs budget warnings

**Why:** Automatic logging, can't be bypassed or forgotten

#### 🗂️ Indexes (1):
1. **`idx_activity_logs_created_at`** - Fast date filtering

#### 📡 Backend API:
- `server/api/activity-logs.get.ts` - Fetches activity logs with filters

**User Experience:** Complete audit trail for compliance and debugging. Managers can see who did what and when.

---

## 🔄 14. UPDATE EVENT STATUS
**Feature on Event Details Page**  
**Purpose:** Change event status (inquiry → confirmed → in_progress → completed)

### What Users See:
- Status dropdown in event header
- Options: Inquiry, Confirmed, In Progress, Completed, Cancelled
- Confirmation dialog before changing
- Success notification

### ADBMS Features Used (3 features):

#### 📊 Stored Procedures (1):
1. **`sp_update_event_status(event_id, new_status, user_id)`**
   - **Validates:**
     - Event exists
     - Valid status transition
     - Only authorized users can cancel
   - **Updates:** Event status
   - **Returns:** Success message

#### ⚡ Triggers (2):
1. **`tr_after_event_status_update`** - Logs status change
   - Logs: "Status changed from 'inquiry' to 'confirmed'"
   
2. **`tr_cascade_event_cancellation`** - Cascades cancellation
   - If status changes to 'cancelled'
   - Auto-cancels: All pending event services
   - Logs: "Event cancelled, all services cancelled"
   - Why: Prevents orphaned service bookings

#### 📡 Backend API:
- `server/api/events/[id]/status.put.ts` - Calls stored procedure

**User Experience:** Cancelling an event automatically cancels all its services. All status changes are logged for audit trail.

---

## 🍴 15. SERVICES CATALOG PAGE
**Route:** `/services`  
**File:** `pages/services/index.vue`  
**Purpose:** Browse available services (catering, decoration, photography)

### What Users See:
- Grid/list of available services
- Each card shows: name, category, price, bookings count
- Filter by: category (catering, decoration, photography, entertainment)
- Sort by: most booked, price, name
- Add/Edit/Delete services (admin only)

### ADBMS Features Used (3 features):

#### 📈 Views (1):
1. **`v_service_stats`** - Service statistics
   - **Aggregations:**
     - COUNT(bookings) - How many times booked
     - SUM(quantity) - Total units sold
     - AVG(price) - Average agreed price
     - SUM(revenue) - Total revenue generated
   - **Why:** Shows popularity and revenue per service

#### 🗂️ Indexes (2):
1. **`idx_services_category`** - Fast category filtering
2. **`idx_services_available`** - Show only available services

#### 📡 Backend API:
- `server/api/services/index.get.ts` - Lists services with stats
- `server/api/services/index.post.ts` - Create service
- `server/api/services/[id].put.ts` - Update service
- `server/api/services/[id].delete.ts` - Delete service

**User Experience:** See which services are popular. Helps managers stock/prepare accordingly.

---

## 📊 ADBMS FEATURES SUMMARY

### Total Features: 45

| Feature Type | Count | Details |
|--------------|-------|---------|
| **Stored Procedures** | 8 | sp_create_event, sp_add_event_service, sp_process_payment, sp_update_event_status, sp_get_event_summary, sp_clone_event, sp_reconcile_payments, sp_monthly_financial_report |
| **Functions** | 11 | fn_calculate_event_cost, fn_calculate_total_paid, fn_calculate_balance, fn_is_event_paid, fn_payment_status, fn_days_until_event, fn_event_profitability, fn_calculate_client_ltv, fn_format_phone, fn_service_unit_total, fn_forecast_monthly_revenue |
| **Views** | 15 | v_event_summary, v_active_events, v_upcoming_events, v_service_stats, v_payment_summary, v_user_activity, v_monthly_revenue, v_service_profitability, v_revenue_trends, v_client_segments, v_event_pipeline, v_category_performance, v_payment_behavior, v_upcoming_events_risk, v_staff_performance |
| **Triggers** | 11 | tr_after_payment_insert, tr_after_payment_update, tr_update_event_status_on_payment, tr_after_event_insert, tr_after_event_status_update, tr_after_service_add, tr_before_payment_insert, tr_before_payment_insert_date, tr_cascade_event_cancellation, tr_generate_payment_reference, tr_budget_overrun_warning |

---

## 🎯 Advanced ADBMS Features Highlighted

### Window Functions (Advanced SQL):
- **`LAG()`** in `v_revenue_trends` - Compare current vs previous month
- **`SUM() OVER()`** in `v_revenue_trends` - Cumulative revenue calculation
- **Used in:** Revenue Trends Report

### CTEs (Common Table Expressions):
- **`service_costs` CTE** - Break down cost calculations
- **`service_bookings` CTE** - Aggregate booking data
- **Used in:** Service Profitability Report

### CASE Statements (Business Logic):
- **Client segmentation** - VIP, Premium, Regular, New
- **Engagement status** - Active, At Risk, Inactive
- **Used in:** Client Segments Report

### Triggers for Automation:
- **Auto-logging** - All activities tracked automatically
- **Auto-confirmation** - Events confirmed when paid
- **Cascade operations** - Cancelling event cancels services
- **Used in:** Every data modification

---

## 🎓 Why ADBMS Features Matter

### 1. **Performance**
- Views pre-calculate complex joins and aggregations
- Indexes speed up queries 10-100x faster
- Functions execute at database level (faster than app code)
- Procedures reduce network round-trips

### 2. **Data Integrity**
- Procedures enforce business rules at database level
- Triggers ensure consistency automatically
- Validation can't be bypassed
- Referential integrity maintained

### 3. **Maintainability**
- Business logic centralized in database
- No code duplication across application
- Single source of truth for calculations
- Easier to update logic

### 4. **Automation**
- Triggers auto-execute (no forgotten operations)
- Activity logs automatic (security audit trail)
- Reference numbers generated automatically
- Status updates happen automatically when conditions met

### 5. **Advanced Analytics**
- Window functions for time-series analysis
- CTEs for complex reporting
- CASE statements for business segmentation
- All without complex application code

---

## 📚 How to Use This Document

**For Evaluation Presentations:**
1. Pick a page (e.g., Event Details)
2. Explain what users see
3. Show which ADBMS features power it
4. Explain WHY those features are used
5. Demonstrate the benefit

**Example:**
> "The Event Details page shows complete financial information. We use 6 database functions to calculate costs in real-time: `fn_calculate_event_cost` sums all services, `fn_calculate_total_paid` tracks payments, and `fn_calculate_balance` shows what's left. This means accurate numbers without complex application code, and calculations are consistent everywhere they're used."

---

**Total Pages Documented:** 15  
**Total ADBMS Features Mapped:** 45
