# 👥 TEAM DIVISION GUIDE - 5 Members

**Total ADBMS Features:** 45 (Distributed evenly across team)
---
## 📝 Overview
> "We built a complete event management system that leverages 45 ADBMS features. Our approach was to centralize business logic in the database layer using stored procedures, functions, views, and triggers. This ensures data integrity, consistency, and performance. Each team member took ownership of a functional module, and together we created a professional, production-ready system."
    ---

## 👤 MEMBER 1: Authentication & Dashboard Module

### Responsibility:
**"I handled user authentication and the main dashboard with business metrics"**

### Pages:
1. **Login Page** (`/auth/login`)
2. **Register Page** (`/auth/register`)
3. **Dashboard** (`/` - homepage)

### ADBMS Features (8 total):

#### Views (3):
1. **`v_upcoming_events`** - Shows events in next 30 days
   - **Your Talking Point:** "This view alerts managers about upcoming events proactively. It calculates days until event and payment status automatically."

2. **`v_event_summary`** - Event overview with financial calculations
   - **Your Talking Point:** "The dashboard uses this view to show event statistics. It pre-joins 4 tables and calculates costs, saving application complexity."

3. **`v_monthly_revenue`** - Revenue breakdown by month
   - **Your Talking Point:** "This tracks business performance month by month, showing total revenue and breakdown by payment method (cash/card/bank)."

#### Functions (1):
4. **`fn_payment_status(event_id)`** - Returns "Fully Paid" / "Partially Paid" / "Unpaid"
   - **Your Talking Point:** "This function provides consistent payment status across all pages. The logic is in one place, ensuring accuracy."

#### Indexes (4):
5. **`idx_users_email`** - Fast login lookup
6. **`idx_users_role`** - Filter by user role
7. **`idx_events_date_status`** - Dashboard event filtering
8. **`idx_payments_date`** - Monthly revenue grouping

### Backend Files:
- `server/api/auth/login.post.ts`
- `server/api/auth/register.post.ts`
- `server/api/dashboard/stats.get.ts`
- `server/api/upcoming-events.get.ts`

### Evaluation Talking Points:

**1. Authentication Security:**
> "I implemented secure authentication using JWT tokens. The `idx_users_email` index ensures fast email lookups during login. All user registrations are automatically logged to `activity_logs` for security auditing."

**2. Dashboard Performance:**
> "The dashboard loads multiple metrics in one request. Instead of writing complex queries in JavaScript, I use database views like `v_upcoming_events` and `v_monthly_revenue`. These views pre-calculate aggregations, making the dashboard load instantly even with thousands of records."

**3. Upcoming Events Widget:**
> "The dashboard includes an alert widget showing events happening in the next 7 days. The `v_upcoming_events` view calculates days until each event and payment status. This helps event managers stay prepared and proactive."

**4. Why Views for Dashboard:**
> "Views are perfect for dashboards because they cache the query execution plan. The `v_event_summary` view joins events, clients, services, and payments in one optimized query. This is much faster than doing multiple queries from the application."

### Module Statistics:
- **Pages:** 3
- **ADBMS Features:** 8 (18% of total)
- **Complexity:** Medium (authentication + aggregations)
- **Lines of Code:** ~800 (frontend + backend)

---

## 👤 MEMBER 2: Event Management Module

### Responsibility:
**"I handled the core event management functionality - creating, viewing, and updating events"**

### Pages:
1. **Events List** (`/events`)
2. **Create Event** (`/events/create`)
3. **Event Details** (`/events/{id}`)
4. **Update Event Status** (feature on details page)

### ADBMS Features (15 total):

#### Stored Procedures (3):
1. **`sp_create_event(...)`** - Creates event with validation
   - **Your Talking Point:** "This procedure validates all input - checks if client exists, date is not in past, budget is positive. Database-level validation prevents bad data."

2. **`sp_get_event_summary(event_id)`** - Loads event details
   - **Your Talking Point:** "This procedure retrieves comprehensive event information in one optimized database call instead of multiple queries."

3. **`sp_update_event_status(...)`** - Changes event status
   - **Your Talking Point:** "This handles status transitions (inquiry → confirmed → completed) with validation to ensure only valid changes are allowed."

#### Views (3):
4. **`v_event_summary`** - Main event data with calculations
5. **`v_payment_summary`** - Payment history for events
6. **`v_user_activity`** - Activity log for events

#### Functions (6):
7. **`fn_calculate_event_cost(event_id)`** - Total service cost
8. **`fn_calculate_total_paid(event_id)`** - Total payments
9. **`fn_calculate_balance(event_id)`** - Remaining balance
10. **`fn_is_event_paid(event_id)`** - Boolean paid status
11. **`fn_payment_status(event_id)`** - Status text
12. **`fn_days_until_event(event_id)`** - Days countdown

#### Triggers (3):
13. **`tr_after_event_insert`** - Logs event creation
14. **`tr_after_event_status_update`** - Logs status changes
15. **`tr_cascade_event_cancellation`** - Auto-cancels services when event cancelled

### Backend Files:
- `server/api/events/index.get.ts` (list)
- `server/api/events/index.post.ts` (create)
- `server/api/events/[id].get.ts` (details)
- `server/api/events/[id]/status.put.ts` (status update)

### Evaluation Talking Points:

**1. Event Creation with Validation:**
> "When creating an event, I use the stored procedure `sp_create_event`. It validates all business rules at the database level - client must be active, date can't be in the past, guest count must be positive. This ensures data integrity that application code alone can't guarantee."

**2. Six Functions for Financial Calculations:**
> "The Event Details page shows financial information using 6 database functions. For example, `fn_calculate_event_cost` sums all services, `fn_calculate_total_paid` tracks payments, and `fn_calculate_balance` shows what's owed. These functions are reusable across the entire application, ensuring consistent calculations."

**3. Automatic Activity Logging:**
> "All event operations are automatically logged using triggers. When an event is created, `tr_after_event_insert` logs it. When status changes, `tr_after_event_status_update` logs the old and new status. This creates a complete audit trail without any manual logging code."

**4. Cascade Cancellation:**
> "One of the most powerful features is the `tr_cascade_event_cancellation` trigger. When an event is cancelled, this trigger automatically cancels all associated services. This prevents orphaned data and ensures referential integrity - all without application code."

### Module Statistics:
- **Pages:** 4 (including status update feature)
- **ADBMS Features:** 15 (33% of total)
- **Complexity:** High (core business logic)
- **Lines of Code:** ~1,500 (frontend + backend)

---

## 👤 MEMBER 3: Services & Payments Module

### Responsibility:
**"I handled financial transactions and service management - the revenue-generating part of the system"**

### Pages:
1. **Add Service to Event** (feature on event details)
2. **Process Payment** (feature on event details)
3. **Payments List** (`/payments`)
4. **Services Catalog** (`/services`)

### ADBMS Features (12 total):

#### Stored Procedures (2):
1. **`sp_add_event_service(...)`** - Adds service to event
   - **Your Talking Point:** "This validates that the service is available, prevents duplicates, and ensures quantity and price are valid."

2. **`sp_process_payment(...)`** - Records payment
   - **Your Talking Point:** "This procedure ensures payment amount doesn't exceed balance, validates payment method, and creates the payment record atomically."

#### Views (3):
3. **`v_payment_summary`** - Payment history with details
4. **`v_service_stats`** - Service popularity and revenue
5. **`v_event_summary`** - For calculating event costs

#### Triggers (5):
6. **`tr_after_service_add`** - Logs service addition
7. **`tr_budget_overrun_warning`** - Warns if budget exceeded
8. **`tr_after_payment_insert`** - Logs payment
9. **`tr_update_event_status_on_payment`** - Auto-confirms paid events
10. **`tr_generate_payment_reference`** - Auto-generates reference numbers

#### Indexes (2):
11. **`idx_payments_event_id`** - Fast payment lookup
12. **`idx_event_services_event_service`** - Prevent duplicate services

### Backend Files:
- `server/api/events/[id]/services.post.ts`
- `server/api/payments/index.get.ts`
- `server/api/payments/index.post.ts`
- `server/api/services/index.get.ts`

### Evaluation Talking Points:

**1. Service Management:**
> "Adding services to events uses `sp_add_event_service` which validates that services are available and prevents adding the same service twice. The `tr_budget_overrun_warning` trigger automatically alerts managers if the total cost exceeds the client's budget."

**2. Payment Processing:**
> "Payment processing is critical for revenue tracking. The `sp_process_payment` procedure ensures payments are valid and atomic. Multiple triggers fire automatically: `tr_generate_payment_reference` creates unique reference numbers like 'PAY-20251024-00123-ABC123', and `tr_after_payment_insert` logs the transaction for audit trails."

**3. Automatic Event Confirmation:**
> "One powerful feature is automatic event confirmation. The `tr_update_event_status_on_payment` trigger compares total paid vs total cost. When an event is fully paid, it automatically changes status from 'inquiry' to 'confirmed'. No manual intervention needed."

**4. Service Statistics:**
> "The Services Catalog page uses `v_service_stats` view which aggregates booking data. It shows how many times each service has been booked, total quantity sold, and revenue generated. This helps managers identify popular services and optimize inventory."

### Module Statistics:
- **Pages:** 4
- **ADBMS Features:** 12 (27% of total)
- **Complexity:** High (financial transactions)
- **Lines of Code:** ~1,200 (frontend + backend)

---

## 👤 MEMBER 4: Reports & Analytics Module

### Responsibility:
**"I handled business intelligence and reporting - using advanced SQL features like window functions and CTEs"**

### Pages:
1. **Revenue Trends Report** (`/reports/revenue-trends`)
2. **Service Profitability Report** (`/reports/service-profitability`)
3. **Client Segments Report** (`/reports/client-segments`)

### ADBMS Features (10 total):

#### Views (3 - All Advanced):
1. **`v_revenue_trends`** - Uses Window Functions
   - **Advanced Feature:** `LAG()` to compare with previous month
   - **Advanced Feature:** `SUM() OVER()` for cumulative revenue
   - **Your Talking Point:** "This view uses window functions - an advanced SQL feature. The `LAG()` function compares current month revenue with the previous month to calculate growth percentage. The `SUM() OVER()` creates a running total of cumulative revenue."

2. **`v_service_profitability`** - Uses CTEs
   - **Advanced Feature:** Common Table Expressions (WITH clause)
   - **CTEs:** `service_costs` and `service_bookings`
   - **Your Talking Point:** "This view uses CTEs to break complex calculations into steps. First CTE calculates estimated costs (70% of price), second CTE aggregates bookings. Then we join them to calculate profit margins. CTEs make complex queries readable and maintainable."

3. **`v_client_segments`** - Uses CASE Statements
   - **Advanced Feature:** Business logic in SQL
   - **CASE Logic:** VIP (>$100k), Premium (>$50k), Regular (>$20k)
   - **Your Talking Point:** "This view uses nested CASE statements to segment clients by spending and engagement. It calculates lifetime value, categorizes clients into segments, and determines if they're active or at risk of churning."

#### Functions (1):
4. **`fn_calculate_client_ltv(client_id)`** - Lifetime value calculation

#### Indexes (6):
5. **`idx_payments_date`** - For revenue grouping
6. **`idx_payments_status`** - Filter completed payments
7. **`idx_event_services_service`** - Service aggregation
8. **`idx_events_client_id`** - Client event lookup
9. **`idx_users_role`** - Filter clients
10. **`idx_payments_event_id`** - Join optimization

### Backend Files:
- `server/api/reports/revenue-trends.get.ts`
- `server/api/reports/service-profitability.get.ts`
- `server/api/reports/client-segments.get.ts`

### Evaluation Talking Points:

**1. Window Functions for Time-Series Analysis:**
> "The Revenue Trends report uses advanced SQL window functions. The `LAG()` function looks back to the previous month's revenue, allowing us to calculate month-over-month growth automatically. The `SUM() OVER()` creates a cumulative revenue chart. These are features you typically see in data analytics platforms, but we implemented them in pure SQL."

**2. CTEs for Complex Business Logic:**
> "Service Profitability uses Common Table Expressions (CTEs) - a best practice for complex queries. The first CTE `service_costs` calculates estimated costs assuming 70% cost and 30% profit margin. The second CTE `service_bookings` aggregates all bookings. We then join these CTEs to calculate actual profit margins. This approach makes the query self-documenting and easier to maintain."

**3. CASE Statements for Business Segmentation:**
> "Client Segments report implements business logic directly in SQL using CASE statements. We automatically categorize clients: VIP customers have spent over $100,000, Premium over $50,000, Regular over $20,000. We also track engagement: Active (booked in last 90 days), At Risk (90-365 days), or Inactive (over a year). This segmentation helps with targeted marketing."

**4. Why Advanced SQL Features:**
> "These advanced features (window functions, CTEs, CASE statements) represent the core of ADBMS capabilities. They allow complex analytics without moving data to the application layer. All calculations happen in the database, which is orders of magnitude faster. This is the power of advanced database management systems."

### Module Statistics:
- **Pages:** 3 (all reports)
- **ADBMS Features:** 10 (22% of total - but most advanced)
- **Complexity:** Very High (advanced SQL)
- **Lines of Code:** ~900 (frontend + backend)
- **Unique Selling Point:** Showcases most advanced ADBMS features

---

## 👤 MEMBER 5: Admin & Monitoring Module

### Responsibility:
**"I handled system administration and monitoring - user management, activity logs, and system oversight"**

### Pages:
1. **User Management** (`/users`)
2. **Activity Logs** (`/activity-logs`)
3. **System Monitoring** (background activity tracking)

### ADBMS Features (8 total):

#### Views (2):
1. **`v_user_activity`** - Activity logs with user details
   - **Your Talking Point:** "This view joins activity logs with user information to create human-readable descriptions like 'John Doe performed UPDATE on events (ID: 123)'. It's used for system auditing and compliance."

2. **Direct access to `users` table** - For user CRUD operations

#### Triggers (11 - All contribute to your module):
All triggers log activities to `activity_logs` table:
3. **`tr_after_payment_insert`** - Logs payment creation
4. **`tr_after_payment_update`** - Logs payment changes
5. **`tr_after_event_insert`** - Logs event creation
6. **`tr_after_event_status_update`** - Logs status changes
7. **`tr_after_service_add`** - Logs service additions
8. **`tr_cascade_event_cancellation`** - Logs cascade operations
9. **`tr_budget_overrun_warning`** - Logs budget warnings
10. **Plus 4 more triggers** for comprehensive logging

#### Indexes (5):
11. **`idx_users_role`** - Fast role filtering
12. **`idx_users_status`** - Status filtering
13. **`idx_users_role_status`** - Combined filtering
14. **`idx_users_email`** - Unique constraint & fast lookup
15. **`idx_users_search`** - Full-text search

### Backend Files:
- `server/api/users/index.get.ts`
- `server/api/users/index.post.ts`
- `server/api/users/[id].put.ts`
- `server/api/users/[id].delete.ts`
- `server/api/activity-logs.get.ts`

### Evaluation Talking Points:

**1. User Management:**
> "User Management is admin-only functionality. I use direct table access with optimized indexes rather than views because simple CRUD operations don't benefit from view overhead. The `idx_users_role_status` composite index allows instant filtering by role and status simultaneously. The `idx_users_search` full-text index enables fast name and email searches."

**2. Comprehensive Activity Logging:**
> "Activity Logs page shows the power of database triggers. All 11 triggers in the system automatically log activities to the `activity_logs` table. This creates a complete audit trail that cannot be bypassed by application code. The `v_user_activity` view formats these logs with user details for easy reading."

**3. Security Audit Trail:**
> "Every single data modification in the system is logged automatically. When a payment is created, when an event status changes, when a service is added - all logged via triggers. This is crucial for compliance, debugging, and security. In a real-world scenario, this audit trail is invaluable for tracking down issues and proving compliance with regulations."

**4. Trigger-Based Automation:**
> "Triggers represent the 'automation' aspect of ADBMS. Unlike stored procedures that you call explicitly, triggers fire automatically. For example, when an event is cancelled, `tr_cascade_event_cancellation` automatically cancels all services and logs the cascade operation. This ensures data consistency without relying on application code remembering to do it."

### Module Statistics:
- **Pages:** 2
- **ADBMS Features:** 8 direct + 11 triggers (19 total - 42% by count)
- **Complexity:** Medium-High (security & monitoring)
- **Lines of Code:** ~800 (frontend + backend)
- **Unique Selling Point:** All 11 triggers contribute to your audit system

---

## 📊 TEAM WORKLOAD DISTRIBUTION

| Member | Pages | ADBMS Features | Complexity | Code Lines | Unique Strength |
|--------|-------|----------------|------------|------------|-----------------|
| **Member 1** | 3 | 8 | Medium | ~800 | Authentication & Dashboard |
| **Member 2** | 4 | 15 | High | ~1,500 | Core Business Logic |
| **Member 3** | 4 | 12 | High | ~1,200 | Financial Transactions |
| **Member 4** | 3 | 10 | Very High | ~900 | Advanced SQL Features |
| **Member 5** | 2 | 8 (+11 triggers) | Medium-High | ~800 | Security & Monitoring |
| **TOTAL** | **16** | **45** | - | **5,200** | Complete System |

---

## 🎤 GROUP PRESENTATION FLOW

### Opening (1 minute):
**Team Leader:** "We built Rosewood Event Management System with 45 ADBMS features. Our team divided the project into 5 functional modules. Let me introduce how we organized ourselves..."

### Individual Presentations (3 minutes each = 15 minutes):

1. **Member 1 - Authentication & Dashboard:**
   - "I built the entry point and overview..."
   - Demo login, show dashboard with metrics
   - Explain `v_upcoming_events` and `v_monthly_revenue` views

2. **Member 2 - Event Management:**
   - "I built the core event operations..."
   - Demo creating event, viewing details, changing status
   - Explain `sp_create_event` procedure and cascade cancellation trigger

3. **Member 3 - Services & Payments:**
   - "I built the revenue-generating features..."
   - Demo adding services, processing payments
   - Explain automatic reference generation and event confirmation triggers

4. **Member 4 - Reports & Analytics:**
   - "I built business intelligence using advanced SQL..."
   - Show revenue trends chart with growth calculations
   - Explain window functions, CTEs, and client segmentation

5. **Member 5 - Admin & Monitoring:**
   - "I built system oversight and security..."
   - Show activity logs with complete audit trail
   - Explain how all 11 triggers contribute to automatic logging

### Closing (2 minutes):
**Team Leader:** 
- "Our system uses 45 ADBMS features: 8 procedures, 11 functions, 15 views, 11 triggers"
- "Key achievements: Automated logging, real-time calculations, advanced analytics"
- "All business logic in database layer ensures consistency and performance"
- Open for questions

**Total Time:** 20 minutes

---

## 📋 INDIVIDUAL PREPARATION CHECKLIST

### For Each Member:

#### 1. Understand Your Features:
- [ ] Read your section in this document thoroughly
- [ ] Review your ADBMS features in the database folder
- [ ] Test your pages to ensure they work correctly
- [ ] Understand WHY each feature was used

#### 2. Prepare Your Demo:
- [ ] Practice showing your pages (1-2 minutes)
- [ ] Prepare SQL examples to show your features
- [ ] Have example data ready to demonstrate
- [ ] Practice explaining benefits clearly

#### 3. Know Your Talking Points:
- [ ] Memorize 2-3 key points about your module
- [ ] Prepare to explain one advanced feature in detail
- [ ] Be ready to answer questions about your area
- [ ] Know how your module connects to others

#### 4. Review Related Modules:
- [ ] Understand what other members did
- [ ] Know how your module interacts with theirs
- [ ] Be prepared to cross-reference features
- [ ] Support teammates during Q&A

---

## ❓ SAMPLE Q&A PREPARATION

### For Member 1 (Dashboard):
**Q:** "Why use views for the dashboard instead of direct queries?"  
**A:** "Views pre-calculate aggregations and cache execution plans. The dashboard loads multiple metrics in one request. Using views like `v_monthly_revenue` means the database optimizes the query once, and all subsequent calls benefit from that optimization."

### For Member 2 (Events):
**Q:** "What happens if someone tries to create an event with a past date?"  
**A:** "The `sp_create_event` stored procedure validates the date before inserting. If the date is in the past, it returns an error message and doesn't create the event. This validation happens at the database level, so it can't be bypassed."

### For Member 3 (Payments):
**Q:** "How do you prevent overpayment?"  
**A:** "The `sp_process_payment` procedure checks that the payment amount doesn't exceed the remaining balance. It calculates total cost minus total paid and rejects payments that would exceed this. The validation is atomic and happens in a database transaction."

### For Member 4 (Reports):
**Q:** "Why use window functions instead of subqueries?"  
**A:** "Window functions process data in a single pass, while subqueries would require multiple passes. In the revenue trends report, `LAG()` accesses the previous month's revenue without a separate query. This is more efficient and the code is cleaner."

### For Member 5 (Activity Logs):
**Q:** "Can users disable activity logging?"  
**A:** "No. That's the power of triggers - they're database-level automation that can't be bypassed by application code. Every data modification automatically fires the appropriate trigger and logs the activity. This ensures a complete, tamper-proof audit trail."

---

## 🎯 SUCCESS CRITERIA

### Individual Success:
- ✅ Can explain your pages clearly (what they do)
- ✅ Can explain your ADBMS features (how they work)
- ✅ Can explain WHY you chose those features (benefits)
- ✅ Can demo your module confidently
- ✅ Can answer basic questions about your area

## 📚 REFERENCE DOCUMENTS

Make sure all team members have read:
1. **ADBMS_FEATURES_BY_PAGE.md** - Complete feature mapping (this shows what each page uses)
2. **README.md** - Project overview and setup
3. **PROJECT_GUIDE.md** - Complete technical documentation
4. **Database folder** - All SQL scripts for your features
5. **This document (TEAM_DIVISION_GUIDE.md)** - Your individual assignments

---
---
**Created:** October 25, 2025  
**Team Members:** 5  
**Modules:** 5  
**ADBMS Features:** 45  
