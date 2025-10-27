# Phase 2 - ADBMS Feature Implementation (Admin & Reporting)

**Date:** October 13, 2025  
**Status:** ✅ COMPLETE

This document describes all ADBMS features used in Phase 2 implementation, organized by page/feature.

---

## 1️⃣ USER MANAGEMENT PAGE

### Frontend File
- **File:** `pages/users/index.vue`
- **Route:** `/users`

### Backend API
- **Files:** 
  - `server/api/users/index.get.ts` - GET `/api/users`
  - `server/api/users/index.post.ts` - POST `/api/users`
  - `server/api/users/[id].put.ts` - PUT `/api/users/:id`
  - `server/api/users/[id].delete.ts` - DELETE `/api/users/:id`

### ADBMS Features Used

#### Direct Table Access with Indexes
**Query:** Direct `users` table with filtering
```sql
SELECT user_id, email, full_name, phone, role, status, created_at
FROM users
WHERE role = ? AND status = ? 
  AND (full_name LIKE ? OR email LIKE ?)
ORDER BY created_at DESC
```

**Why:** Simple CRUD operations don't need views, direct table access is more efficient

**Advantage:** 
- Fast queries using indexes
- Flexible dynamic filtering
- Real-time data without view overhead

#### Aggregation Query for Role Statistics
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role
```

**Why:** Simple aggregation for dashboard statistics

**Advantage:**
- Real-time role distribution
- Fast GROUP BY using idx_users_role
- No additional view needed for simple stats

#### Indexes Supporting This Page
```sql
-- Primary key for user lookup
PRIMARY KEY (user_id)

-- Role-based filtering
CREATE INDEX idx_users_role ON users(role);

-- Status filtering
CREATE INDEX idx_users_status ON users(status);

-- Combined role + status queries
CREATE INDEX idx_users_role_status ON users(role, status);

-- Email uniqueness and login
CREATE INDEX idx_users_email ON users(email);

-- Full-text search on users
CREATE FULLTEXT INDEX idx_users_search ON users(full_name, email);
```

**Index Benefits:**
- **idx_users_role**: Fast filtering by role (admin, manager, client)
- **idx_users_status**: Fast filtering by active/inactive status
- **idx_users_role_status**: Optimizes combined role + status filters
- **idx_users_search**: Enables fast full-text search on names and emails

#### Query Execution Flow
1. **Authentication check** → Verify user has admin role
2. **Apply filters** → Uses idx_users_role_status for role + status filtering
3. **Search filter** → Uses idx_users_search for full-text search on names/emails
4. **Aggregation** → Uses idx_users_role for role count statistics
5. **Sort results** → Orders by created_at DESC

---

## 2️⃣ REVENUE TRENDS REPORT

### Frontend File
- **File:** `pages/reports/revenue-trends.vue`
- **Route:** `/reports/revenue-trends`

### Backend API
- **File:** `server/api/reports/revenue-trends.get.ts`
- **Method:** GET `/api/reports/revenue-trends`

### ADBMS Features Used

#### Views (1)
**1. `v_revenue_trends`** - Revenue analysis with window functions
```sql
SELECT 
  month,
  monthly_revenue,
  events_count,
  avg_transaction,
  growth_pct
FROM v_revenue_trends
ORDER BY month DESC
LIMIT 12
```

**View Definition:**
```sql
CREATE VIEW v_revenue_trends AS
SELECT 
    DATE_FORMAT(p.payment_date, '%Y-%m') as month,
    SUM(p.amount) as monthly_revenue,
    COUNT(DISTINCT p.event_id) as events_count,
    AVG(p.amount) as avg_transaction,
    LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(...)) as prev_month_revenue,
    ROUND(((SUM(p.amount) - LAG(SUM(p.amount)) OVER (...)) / 
           NULLIF(LAG(SUM(p.amount)) OVER (...), 0)) * 100, 2) as growth_pct,
    SUM(SUM(p.amount)) OVER (ORDER BY ... 
                             ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as cumulative_revenue
FROM payments p
WHERE p.status = 'completed'
GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
```

**Why Use Window Functions (LAG):**
- Calculate month-over-month growth automatically
- Compare current month with previous month in single query
- No need for self-joins or subqueries
- Cumulative calculations using ROWS BETWEEN

**Advantages:**
- **Automatic Growth Calculation**: LAG() compares current month with previous automatically
- **Single Query**: No need for multiple queries or application-level calculations
- **Efficient**: Window functions process data in one pass
- **Cumulative Revenue**: ROWS BETWEEN UNBOUNDED PRECEDING tracks running totals
- **Consistent Logic**: Growth rate calculation centralized in database

#### Indexes Supporting This Page
```sql
-- Fast payment filtering by status
CREATE INDEX idx_payments_status ON payments(status);

-- Fast date-based queries
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Combined date + status for view optimization
CREATE INDEX idx_payments_date_status ON payments(payment_date, status);

-- Event counting
CREATE INDEX idx_payments_event_id ON payments(event_id);
```

**Index Benefits:**
- **idx_payments_date_status**: Optimizes WHERE status='completed' and date grouping
- **idx_payments_payment_date**: Fast DATE_FORMAT grouping
- **idx_payments_event_id**: Fast DISTINCT event counting

#### Query Execution Flow
1. **Query v_revenue_trends view** → Uses idx_payments_date_status
2. **GROUP BY month** → Uses idx_payments_payment_date
3. **LAG() window function** → Calculates previous month values
4. **Growth calculation** → Automatic % growth using LAG results
5. **Cumulative sum** → Running total using ROWS BETWEEN
6. **LIMIT** → Return last N months

---

## 3️⃣ CLIENT SEGMENTATION REPORT

### Frontend File
- **File:** `pages/reports/client-segments.vue`
- **Route:** `/reports/client-segments`

### Backend API
- **File:** `server/api/reports/client-segments.get.ts`
- **Method:** GET `/api/reports/client-segments`

### ADBMS Features Used

#### Views (1)
**1. `v_client_segments`** - Customer segmentation with CASE statements
```sql
SELECT 
  client_segment as segment,
  COUNT(*) as client_count,
  SUM(total_events) as total_events,
  SUM(lifetime_value) as total_spent,
  ROUND(AVG(avg_payment), 2) as avg_event_value,
  MAX(last_event_date) as last_event_date
FROM v_client_segments
GROUP BY client_segment
ORDER BY 
  CASE client_segment COLLATE utf8mb4_unicode_ci
    WHEN 'VIP' THEN 1
    WHEN 'Premium' THEN 2
    WHEN 'Regular' THEN 3
    WHEN 'New' THEN 4
    ELSE 5
  END
```

**View Definition:**
```sql
CREATE VIEW v_client_segments AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    u.phone,
    COUNT(DISTINCT e.event_id) as total_events,
    SUM(CASE WHEN e.status = 'completed' THEN 1 ELSE 0 END) as completed_events,
    COALESCE(SUM(p.amount), 0) as lifetime_value,
    COALESCE(AVG(p.amount), 0) as avg_payment,
    MAX(e.event_date) as last_event_date,
    DATEDIFF(CURDATE(), MAX(e.event_date)) as days_since_last_event,
    CASE 
        WHEN COALESCE(SUM(p.amount), 0) >= 100000 THEN 'VIP'
        WHEN COALESCE(SUM(p.amount), 0) >= 50000 THEN 'Premium'
        WHEN COALESCE(SUM(p.amount), 0) >= 20000 THEN 'Regular'
        WHEN COUNT(DISTINCT e.event_id) > 0 THEN 'New'
        ELSE 'Prospect'
    END as client_segment,
    CASE 
        WHEN MAX(e.event_date) IS NULL THEN 'Never Booked'
        WHEN DATEDIFF(CURDATE(), MAX(e.event_date)) <= 90 THEN 'Active'
        WHEN DATEDIFF(CURDATE(), MAX(e.event_date)) <= 365 THEN 'At Risk'
        ELSE 'Inactive'
    END as engagement_status
FROM users u
LEFT JOIN events e ON u.user_id = e.client_id
LEFT JOIN payments p ON e.event_id = p.event_id AND p.status = 'completed'
WHERE u.role = 'client'
GROUP BY u.user_id
```

**Why Use CASE Statements:**
- Implement business rules for client classification in database
- Automatic tier assignment based on spending
- Consistent segmentation logic across application
- Real-time updates as clients spend more

**Why Use DATEDIFF Function:**
- Calculate days since last event
- Determine engagement status (Active/At Risk/Inactive)
- Database-level date calculations (accurate and fast)

**Advantages:**
- **Automatic Classification**: CASE statement assigns VIP/Premium/Regular/New based on lifetime value
- **Multi-tier Logic**: Multiple CASE statements for segment and engagement status
- **Aggregate Functions**: SUM, COUNT, AVG calculate customer metrics
- **COALESCE**: Handles NULL values for clients without events/payments
- **Date Functions**: DATEDIFF + CURDATE() calculate customer recency
- **Business Rules in DB**: Segmentation thresholds (Rs. 100K, 50K, 20K) in one place

#### Indexes Supporting This Page
```sql
-- User filtering by role
CREATE INDEX idx_users_role ON users(role);

-- Event lookups by client
CREATE INDEX idx_events_client_id ON events(client_id);

-- Payment filtering
CREATE INDEX idx_payments_event_status ON payments(event_id, status);

-- Event date sorting
CREATE INDEX idx_events_event_date ON events(event_date);
```

**Index Benefits:**
- **idx_users_role**: Fast filtering to only 'client' role users
- **idx_events_client_id**: Optimizes LEFT JOIN to events table
- **idx_payments_event_status**: Fast filtering for completed payments only
- **idx_events_event_date**: Optimizes MAX(event_date) calculation

#### Query Execution Flow
1. **Query v_client_segments view** → Uses idx_users_role to filter clients
2. **LEFT JOIN events** → Uses idx_events_client_id
3. **LEFT JOIN payments** → Uses idx_payments_event_status
4. **GROUP BY user_id** → Aggregates per-client metrics
5. **CASE classification** → Assigns VIP/Premium/Regular/New segments
6. **Aggregate in API** → Additional GROUP BY client_segment for summary
7. **CASE for sorting** → Orders segments by priority (VIP first)

---

## 4️⃣ SERVICE PROFITABILITY REPORT

### Frontend File
- **File:** `pages/reports/service-profitability.vue`
- **Route:** `/reports/service-profitability`

### Backend API
- **File:** `server/api/reports/service-profitability.get.ts`
- **Method:** GET `/api/reports/service-profitability`

### ADBMS Features Used

#### Views (1)
**1. `v_service_profitability`** - Service profit analysis with CTEs
```sql
SELECT 
  service_name,
  bookings,
  revenue,
  estimated_cost,
  estimated_total_profit,
  profit_margin_pct
FROM v_service_profitability
WHERE bookings > 0
ORDER BY profit_margin_pct DESC
```

**View Definition:**
```sql
CREATE VIEW v_service_profitability AS
WITH service_costs AS (
    SELECT 
        s.service_id,
        s.service_name,
        s.unit_price,
        s.unit_price * 0.7 as estimated_cost,
        s.unit_price * 0.3 as estimated_profit
    FROM services s
),
service_bookings AS (
    SELECT 
        es.service_id,
        COUNT(DISTINCT es.event_id) as bookings,
        SUM(es.quantity) as total_quantity,
        SUM(es.quantity * es.agreed_price) as actual_revenue,
        AVG(es.agreed_price) as avg_price
    FROM event_services es
    WHERE es.status != 'cancelled'
    GROUP BY es.service_id
)
SELECT 
    sc.service_id,
    sc.service_name,
    sc.unit_price,
    COALESCE(sb.bookings, 0) as bookings,
    COALESCE(sb.total_quantity, 0) as quantity_sold,
    COALESCE(sb.actual_revenue, 0) as revenue,
    COALESCE(sb.avg_price, sc.unit_price) as avg_selling_price,
    sc.estimated_cost,
    sc.estimated_profit,
    COALESCE(sb.actual_revenue, 0) - (sc.estimated_cost * COALESCE(sb.total_quantity, 0)) as estimated_total_profit,
    CASE 
        WHEN COALESCE(sb.actual_revenue, 0) = 0 THEN 0
        ELSE ROUND(((COALESCE(sb.actual_revenue, 0) - (sc.estimated_cost * COALESCE(sb.total_quantity, 0))) / 
                    COALESCE(sb.actual_revenue, 0)) * 100, 2)
    END as profit_margin_pct
FROM service_costs sc
LEFT JOIN service_bookings sb ON sc.service_id = sb.service_id
ORDER BY estimated_total_profit DESC
```

**Why Use CTEs (Common Table Expressions):**
- Break down complex profit calculations into logical steps
- First CTE: Calculate estimated costs (70% cost, 30% profit)
- Second CTE: Aggregate booking data
- Final SELECT: Join and calculate profit margins
- More readable and maintainable than nested subqueries

**Why Use Cost Estimation (70/30 ratio):**
- Estimate profit margins when actual costs not tracked
- Industry-standard cost ratio for service businesses
- Enables profit analysis without detailed cost tracking

**Advantages:**
- **Multi-level CTEs**: Two CTEs organize complex calculations
- **service_costs CTE**: Calculates estimated cost per unit (70% of price)
- **service_bookings CTE**: Aggregates revenue and quantities
- **Cost Calculation**: Automatic profit = revenue - (cost × quantity)
- **Profit Margin %**: Automatic percentage calculation
- **COALESCE**: Handles services with zero bookings
- **Clear Logic**: Separates cost estimation from revenue aggregation

#### Indexes Supporting This Page
```sql
-- Service lookups
PRIMARY KEY (service_id)

-- Event service queries
CREATE INDEX idx_event_services_service_id ON event_services(service_id);
CREATE INDEX idx_event_services_status ON event_services(status);

-- Combined for view optimization
CREATE INDEX idx_event_services_event_status ON event_services(event_id, status);
```

**Index Benefits:**
- **PRIMARY KEY**: Fast service lookups in service_costs CTE
- **idx_event_services_service_id**: Optimizes GROUP BY in service_bookings CTE
- **idx_event_services_status**: Fast filtering for non-cancelled services

#### Query Execution Flow
1. **CTE: service_costs** → Reads services table, calculates 70/30 cost ratio
2. **CTE: service_bookings** → Uses idx_event_services_status, aggregates bookings
3. **LEFT JOIN CTEs** → Combines cost and revenue data
4. **Calculate profit** → revenue - (cost × quantity)
5. **Calculate margin %** → (profit / revenue) × 100
6. **COALESCE handling** → Returns 0 for services with no bookings
7. **ORDER BY** → Ranks services by profitability

---

## 📊 SUMMARY: Phase 2 ADBMS Features Usage

### Views Used: 3
1. **`v_revenue_trends`** - Monthly revenue with window functions (LAG)
2. **`v_client_segments`** - Client classification with CASE statements
3. **`v_service_profitability`** - Profit analysis with CTEs

**Key Advanced Features:**
- **Window Functions**: LAG() for month-over-month comparisons
- **CTEs**: Multi-level Common Table Expressions for complex calculations
- **CASE Statements**: Business rule implementation for client segmentation
- **Aggregations**: SUM, COUNT, AVG, MAX for metrics
- **Date Functions**: DATEDIFF, CURDATE() for recency analysis
- **COALESCE**: NULL handling for LEFT JOINs

### Direct Table Queries: 1
1. **`users` table** - With dynamic filtering and aggregation

**Why Direct Access:**
- Simple CRUD operations
- Flexible filtering
- No complex joins needed
- Real-time data

### Indexes Used: 20+
**Performance Optimizations:**
- Primary keys for fast lookups
- Role-based filtering (idx_users_role)
- Status filtering (idx_payments_status, idx_events_status)
- Date-based queries (idx_payments_payment_date, idx_events_event_date)
- Composite indexes for combined filters
- Full-text search indexes (idx_users_search)

---

## 🎯 Advanced ADBMS Features Demonstrated

### 1. Window Functions (v_revenue_trends)
```sql
LAG(SUM(p.amount)) OVER (ORDER BY DATE_FORMAT(p.payment_date, '%Y-%m'))
```
**Purpose:** Calculate previous period values for growth analysis  
**Benefit:** Automatic month-over-month comparisons without self-joins

### 2. CTEs (v_service_profitability)
```sql
WITH service_costs AS (...),
     service_bookings AS (...)
SELECT ... FROM service_costs JOIN service_bookings
```
**Purpose:** Break complex queries into logical, reusable steps  
**Benefit:** Better readability, maintainability, and query optimization

### 3. CASE Statements (v_client_segments)
```sql
CASE 
    WHEN lifetime_value >= 100000 THEN 'VIP'
    WHEN lifetime_value >= 50000 THEN 'Premium'
    ...
END as client_segment
```
**Purpose:** Implement business rules for classification  
**Benefit:** Centralized logic, automatic categorization, easy to modify

### 4. Aggregate Functions
- **SUM()**: Total revenue, lifetime value calculations
- **COUNT()**: Event counts, client counts
- **AVG()**: Average payment, average price
- **MAX()**: Last event date for recency

### 5. Date Functions
- **DATE_FORMAT()**: Group payments by month (YYYY-MM)
- **DATEDIFF()**: Days since last event
- **CURDATE()**: Current date for comparisons

### 6. NULL Handling
- **COALESCE()**: Default values for LEFT JOINs
- Ensures calculations work for clients with no events/payments

---

## 💡 Why These Features Matter

### Performance Benefits

- **Window Functions**: Single-pass data processing (vs. multiple subqueries)
- **CTEs**: Query optimizer can better plan execution
- **Indexes**: 10-100x faster queries with proper indexing
- **Views**: Pre-optimized query plans

### Business Logic Benefits

- **CASE Statements**: Business rules in database (single source of truth)
- **Date Functions**: Accurate calculations at database level
- **Aggregations**: Real-time metrics without caching

### Development Benefits

- **CTEs**: Complex queries broken into understandable steps
- **Views**: Application code stays simple
- **Consistent Results**: Same calculation logic everywhere

---

**ADBMS Features Used:** 3 advanced views + 20+ indexes  
**Advanced Features:** Window Functions (LAG), CTEs, CASE statements, Aggregations, Date Functions  
**Focus:** Reporting and analytics leveraging advanced SQL capabilities
