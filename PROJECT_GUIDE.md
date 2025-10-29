# 📖 Rosewood Event System - Complete Project Guide
---

## 🎯 Project Overview

### Purpose
ADBMS (Advanced Database Management Systems) course project demonstrating mastery of advanced MySQL features in a real-world application.

### Technology Stack
- **Frontend:** Nuxt 3.4.1, Vue 3 (Composition API), Tailwind CSS
- **Backend:** Nuxt Server API, JWT Authentication
- **Database:** MySQL 8.0+ with InnoDB engine
- **Security:** Bcrypt password hashing, role-based access control

---

## ✅ Current Implementation

### What's Working Now

#### ✅ Frontend Pages
- `/` - Dashboard with event statistics
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/events` - Events listing with filters
- `/events/create` - Create new event
- `/events/[id]` - Event details page
- `/services` - Services catalog
- `/payments` - Payments listing
- `/users` - User management (admin)
- `/activity-logs` - Activity logs viewer
- `/reports/revenue-trends` - Revenue analysis
- `/reports/service-profitability` - Service profit report
- `/reports/client-segments` - Client segmentation

#### ✅ Backend APIs (18 endpoints)
```
Auth:     POST /api/auth/login, /api/auth/register
Events:   GET, POST, PUT, DELETE /api/events
          GET /api/events/:id
          GET, POST /api/events/:id/services
          GET /api/events/:id/payments
          PUT /api/events/:id/status
Services: GET, POST, PUT, DELETE /api/services
Payments: GET, POST, PUT, DELETE /api/payments
Users:    GET, POST, PUT, DELETE /api/users
Reports:  GET /api/reports/revenue-trends
          GET /api/reports/service-profitability
          GET /api/reports/client-segments
Dashboard: GET /api/dashboard/stats
Logs:     GET /api/activity-logs
Alerts:   GET /api/upcoming-events
```

#### ✅ Database (Complete)
- 7 tables with relationships
- 8 stored procedures
- 11 user-defined functions (includes 3 advanced)
- 15 database views (includes 3 advanced)
- 11 triggers (automatic logging & automation)
- 30+ indexes
- 100+ sample records

---

## 🗄️ Database Features (80% - COMPLETE)

### 1. Tables (7)

```sql
users              -- User accounts (client, staff, admin)
event_types        -- Event categories
services           -- Service catalog
events             -- Event bookings
event_services     -- Many-to-many junction table
payments           -- Payment records
activity_logs      -- Audit trail
```

**Relationships:**
- users → events (one-to-many)
- events → event_types (many-to-one)
- events ←→ services (many-to-many via event_services)
- events → payments (one-to-many)

---

### 2. Stored Procedures (8)

#### `sp_create_event`
```sql
CALL sp_create_event(
  'Event Name', event_type_id, client_id, 
  'event_date', 'venue', expected_guests, 
  estimated_cost, 'requirements', @new_id
);
```
- Creates event with validation
- Checks client exists and is active
- Transaction-safe with ROLLBACK on error

#### `sp_add_event_service`
```sql
CALL sp_add_event_service(
  event_id, service_id, quantity, 
  unit_price, 'notes', @new_id
);
```
- Adds service to event
- Prevents duplicate services
- Validates service availability

#### `sp_process_payment`
```sql
CALL sp_process_payment(
  event_id, amount, 'payment_method', 
  'payment_date', 'notes', @payment_id
);
```
- Records payment with validation
- Checks balance doesn't go negative
- Transaction-safe

#### `sp_update_event_status`
```sql
CALL sp_update_event_status(event_id, 'new_status');
```
- Updates event status
- Logs change to activity_logs
- Validates status transitions

#### `sp_get_event_summary`
```sql
CALL sp_get_event_summary(event_id);
```
- Returns complete event info
- Includes services, payments, client details
- Multi-table JOIN

#### `sp_reconcile_payments`
```sql
CALL sp_reconcile_payments(event_id);
```
- Reconciles payment records
- Validates payment totals against event cost

#### `sp_clone_event`
```sql
CALL sp_clone_event(event_id, new_date, @new_event_id);
```
- Duplicates event with services
- Useful for recurring events

#### `sp_generate_monthly_report`
```sql
CALL sp_generate_monthly_report(year, month);
```
- Generates monthly financial summary
- Revenue, expenses, profit calculations

---

### 3. User-Defined Functions (11)

```sql
fn_calculate_event_cost(event_id)     → DECIMAL  -- Sum all service costs
fn_calculate_total_paid(event_id)     → DECIMAL  -- Sum all payments
fn_calculate_balance(event_id)        → DECIMAL  -- Cost - payments
fn_is_event_paid(event_id)            → TINYINT  -- Boolean check
fn_days_until_event(event_id)         → INT      -- Days remaining
fn_format_phone(phone)                → VARCHAR  -- Format phone number
fn_service_unit_total(qty, price)     → DECIMAL  -- Qty × price
fn_event_profitability(event_id)      → DECIMAL  -- Profit margin %
fn_calculate_client_ltv(client_id)    → DECIMAL  -- Customer lifetime value
fn_payment_status(event_id)           → VARCHAR  -- Status text
fn_forecast_monthly_revenue(month)    → DECIMAL  -- Revenue forecasting
```

**Usage Examples:**
```sql
-- Get event balance
SELECT fn_calculate_balance(1) AS balance;

-- Check if paid
SELECT fn_is_event_paid(1) AS is_paid;

-- Days until event
SELECT event_name, fn_days_until_event(event_id) AS days_left
FROM events WHERE event_id = 1;
```

---

### 4. Database Views (15)

#### `v_event_summary` - Complete event overview
```sql
SELECT * FROM v_event_summary;
-- Returns: event details + client + type + totals (5-table JOIN)
```

#### `v_active_events` - Current non-completed events
```sql
SELECT * FROM v_active_events;
-- WHERE status NOT IN ('completed', 'cancelled')
```

#### `v_upcoming_events` - Future events
```sql
SELECT * FROM v_upcoming_events;
-- WHERE event_date >= CURDATE()
```

#### `v_service_stats` - Service usage statistics
```sql
SELECT * FROM v_service_stats;
-- COUNT and SUM aggregations by service
```

#### `v_payment_summary` - Payment analytics
```sql
SELECT * FROM v_payment_summary;
-- SUM(amount) grouped by event
```

#### `v_user_activity` - User action logs
```sql
SELECT * FROM v_user_activity;
-- Activity logs with user details
```

#### `v_monthly_revenue` - Revenue by month
```sql
SELECT * FROM v_monthly_revenue;
-- DATE_FORMAT and GROUP BY month
```

#### `v_service_profitability` - Service profit analysis (Advanced)
```sql
SELECT * FROM v_service_profitability;
-- Uses CTEs for cost/profit calculations
```

#### `v_revenue_trends` - Revenue trends (Advanced)
```sql
SELECT * FROM v_revenue_trends;
-- Uses window functions (LAG, SUM OVER)
```

#### `v_client_segments` - Client segmentation (Advanced)
```sql
SELECT * FROM v_client_segments;
-- Uses CASE statements for VIP/Premium/Regular classification
```

**Plus 5 more supporting views:** v_event_pipeline, v_category_performance, v_payment_behavior, v_upcoming_events_risk, v_staff_performance

---

### 5. Triggers (11)

**Activity Logging:**
- `tr_after_payment_insert` - Logs payment creation
- `tr_after_payment_update` - Logs payment changes
- `tr_after_event_insert` - Logs event creation
- `tr_after_event_status_update` - Logs status changes
- `tr_after_service_add` - Logs service additions

**Validation:**
- `tr_before_payment_insert` - Validates payment amount > 0
- `tr_before_payment_insert_date` - Sets default payment date

**Automation:**
- `tr_update_event_status_on_payment` - Auto-confirms when fully paid
- `tr_cascade_event_cancellation` - Cancels services when event cancelled
- `tr_generate_payment_reference` - Auto-generates reference numbers
- `tr_budget_overrun_warning` - Logs warning if budget exceeded

---

### 6. Indexes (33 + 7 PKs = 40 total)

**Regular Indexes (30):**
```sql
-- Users (4)
idx_users_email, idx_users_role, idx_users_status, idx_users_role_status

-- Events (6)
idx_events_client_id, idx_events_event_type_id, idx_events_event_date
idx_events_status, idx_events_date_status, idx_events_client_status

-- Event Types (1)
idx_event_types_is_active

-- Services (3)
idx_services_category, idx_services_is_available, idx_services_category_available

-- Event Services (4)
idx_event_services_event_id, idx_event_services_service_id
idx_event_services_status, idx_event_services_event_status

-- Payments (7)
idx_payments_event_id, idx_payments_payment_date, idx_payments_status
idx_payments_event_status, idx_payments_date_status
idx_payments_payment_method, idx_payments_payment_type

-- Activity Logs (5)
idx_activity_logs_user_id, idx_activity_logs_table_name
idx_activity_logs_created_at, idx_activity_logs_action_type
idx_activity_logs_user_date
```

**Full-Text Indexes (3):**
```sql
idx_events_search FULLTEXT(event_name, venue)
idx_users_search FULLTEXT(full_name, email)
idx_services_search FULLTEXT(service_name, description)
```

**Primary Keys (7):**
```sql
user_id, event_type_id, service_id, event_id
event_service_id, payment_id, log_id
```

---

## 💻 Application Features

### Authentication & Authorization ✅
- JWT token-based authentication
- Bcrypt password hashing (10 salt rounds)
- 3 roles: Client, Staff, Admin
- Role-based API access control
- Token persistence in localStorage

### Events Management ✅
- View all events (role-filtered)
- Create events (Staff/Admin only)
- Update event details
- Delete events (Admin only)
- Assign services to events
- Track event status workflow

### Services Management ✅
- **Public browsing** (no authentication needed)
- Category-based filtering
- CRUD operations (Staff/Admin)
- Base price management
- Status control (active/inactive)

### Payments Management ✅
- Record payments for events
- Multiple payment methods
- Payment history per event
- Balance calculation
- Payment summary

### User Interface ✅
- Dark theme (Zinc + Rose colors)
- Responsive design
- Header with user menu
- Sidebar navigation
- Search and filters
- Loading states
- Error handling

---

## 📡 API Reference

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "lakindu02@gmail.com",
  "password": "Test123"
}

Response: { success, token, user }
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "full_name": "Full Name",
  "phone": "0771234567",
  "role": "client"
}
```

---

### Events

#### Get All Events
```http
GET /api/events
Authorization: Bearer <token>

Response: { success, data: [...events] }
```

#### Get Single Event
```http
GET /api/events/:id
Authorization: Bearer <token>
```

#### Create Event (Staff/Admin)
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "event_name": "Wedding",
  "event_type_id": 1,
  "client_id": 1,
  "event_date": "2025-12-15",
  "venue": "Hotel",
  "expected_guests": 200,
  "estimated_cost": 500000
}
```

#### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>

{ "status": "confirmed", "estimated_cost": 600000 }
```

#### Get Event Services
```http
GET /api/events/:id/services
Authorization: Bearer <token>
```

#### Add Service to Event (Staff)
```http
POST /api/events/:id/services
Authorization: Bearer <token>

{
  "service_id": 1,
  "quantity": 2,
  "unit_price": 50000,
  "notes": "Premium package"
}
```

#### Get Event Payments
```http
GET /api/events/:id/payments
Authorization: Bearer <token>

Response: { success, payments: [...], summary: {...} }
```

---

### Services

#### Get All Services (PUBLIC - No Auth Needed)
```http
GET /api/services

Response: { success, services: [...] }
```

#### Create Service (Staff/Admin)
```http
POST /api/services
Authorization: Bearer <token>

{
  "service_name": "Photography",
  "category": "Photography",
  "description": "Professional photography",
  "base_price": 150000,
  "unit": "day"
}
```

---

### Payments

#### Record Payment
```http
POST /api/payments
Authorization: Bearer <token>

{
  "event_id": 1,
  "amount": 100000,
  "payment_method": "cash",
  "payment_date": "2025-10-11",
  "notes": "Initial deposit"
}

Payment methods: cash, bank_transfer, credit_card, debit_card, cheque
```

#### Update Payment
```http
PUT /api/payments/:id
Authorization: Bearer <token>

{ "amount": 150000, "notes": "Updated amount" }
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm 9+

### Step-by-Step Setup

```bash
# 1. Install dependencies
npm install

# 2. Create MySQL database
mysql -u root -p
CREATE DATABASE rosewood_events;
EXIT;

# 3. Import database (IN ORDER!)
cd database
mysql -u root -p rosewood_events < schema/create_tables.sql
mysql -u root -p rosewood_events < procedures/all_procedures.sql
mysql -u root -p rosewood_events < functions/all_functions.sql
mysql -u root -p rosewood_events < views/all_views.sql
mysql -u root -p rosewood_events < triggers/all_triggers.sql
mysql -u root -p rosewood_events < indexes/all_indexes.sql
mysql -u root -p rosewood_events < seed_data.sql

# 4. Create .env file in project root
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=rosewood_events
DB_PORT=3306
JWT_SECRET=your-secret-key-min-32-chars

# 5. Start development server
npm run dev

# 6. Open browser
http://localhost:3000
```

### Test Credentials
```
Client:
  Email: lakindu02@gmail.com
  Password: Test123

Admin:
  Email: admin@rosewood.com
  Password: Test123

Staff:
  Email: staff@rosewood.com
  Password: Test123
```

---

---

## 📁 Project Structure

```
Rosewood-Event-System/
│
├── 📄 README.md                    # Simple project overview
├── 📖 PROJECT_GUIDE.md            # THIS FILE - Complete documentation
│
├── 🗄️ database/                    # All SQL scripts
│   ├── schema/
│   │   └── create_tables.sql      # 7 tables with relationships
│   ├── procedures/
│   │   ├── sp_create_event.sql
│   │   ├── sp_add_event_service.sql
│   │   ├── sp_process_payment.sql
│   │   ├── sp_update_event_status.sql
│   │   ├── sp_get_event_summary.sql
│   │   └── all_procedures.sql     # All 5 procedures
│   ├── functions/
│   │   ├── fn_calculate_*.sql
│   │   └── all_functions.sql      # All 7 functions
│   ├── views/
│   │   ├── v_event_summary.sql
│   │   └── all_views.sql          # All 7 views
│   ├── triggers/
│   │   ├── tr_after_payment.sql
│   │   └── all_triggers.sql       # All 8 triggers
│   ├── indexes/
│   │   └── all_indexes.sql        # 30+ indexes
│   └── seed_data.sql              # 100+ sample records
│
├── 📡 server/                      # Backend
│   ├── api/
│   │   ├── auth/                  # Login, Register
│   │   ├── events/                # Events CRUD + services + payments
│   │   ├── services/              # Services CRUD
│   │   └── payments/              # Payments CRUD
│   ├── middleware/
│   │   └── auth.ts                # JWT verification
│   ├── db/
│   │   └── connection.ts          # MySQL connection
│   └── utils/
│       ├── jwt.ts                 # Token generation
│       └── validation.ts          # Input validation
│
├── 🎨 pages/                       # Frontend
│   ├── index.vue                  # Dashboard
│   ├── auth/
│   │   ├── login.vue              # Login page
│   │   └── register.vue           # Registration
│   ├── events/
│   │   ├── index.vue              # Events listing
│   │   └── [id].vue               # Event details
│   └── services/
│       └── index.vue              # Services catalog ✅
│
├── 🧩 components/
│   └── common/
│       ├── AppHeader.vue          # Header component
│       └── AppSidebar.vue         # Sidebar navigation
│
├── 🏪 stores/
│   ├── auth.ts                    # Auth state (Pinia)
│   └── events.ts                  # Events state
│
└── ⚙️ Configuration
    ├── nuxt.config.ts             # Nuxt configuration
    ├── tailwind.config.ts         # Tailwind theme
    ├── tsconfig.json              # TypeScript config
    └── package.json               # Dependencies
```

---

## 📊 Implementation Status

| Feature | Status | Details |
|---------|--------|---------|
| **Database (80%)** | ✅ 100% | All requirements exceeded |
| Tables | ✅ | 7 tables (required 5+) |
| Procedures | ✅ | 5 procedures (required 3+) |
| Functions | ✅ | 7 functions (required 3+) |
| Views | ✅ | 7 views (required 3+) |
| Triggers | ✅ | 8 triggers (required 3+) |
| Indexes | ✅ | 30+ indexes |
| Sample Data | ✅ | 100+ records |
| **Application (20%)** | ✅ 95% | Fully functional |
| Authentication | ✅ | JWT + Bcrypt |
| Events Management | ✅ | Full CRUD |
| Services Management | ✅ | Full CRUD + Public browsing |
| Payments Management | ✅ | Recording + tracking |
| UI/UX | ✅ | Dark theme, responsive |
| API Documentation | ✅ | Complete |

### ⏳ Optional (5%)
- Payment list page
- Analytics/reports page
- User management admin panel

---

## 📞 Contact

**Developer:** Lakindu Sadumina  
**Email:** lakindu02@gmail.com  
**Course:** Advanced Database Management Systems (ADBMS)  
**Date:** October 2025

---

**End of Guide** - For simple overview, see README.md
