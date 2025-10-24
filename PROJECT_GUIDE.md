# 📖 Rosewood Event System - Complete Project Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Implementation](#current-implementation)
3. [Database Features (80%)](#database-features)
4. [Application Features (20%)](#application-features)
5. [API Reference](#api-reference)
6. [Setup & Installation](#setup--installation)
7. [Testing Guide](#testing-guide)
8. [Demo Instructions](#demo-instructions)
9. [Future Work](#future-work)
10. [Project Structure](#project-structure)

---

## 🎯 Project Overview

### Purpose
ADBMS (Advanced Database Management Systems) course project demonstrating mastery of advanced MySQL features in a real-world application.

### Requirements Compliance
- **Database Features (80%):** ✅ COMPLETE - Exceeded all requirements
- **Application (20%):** ✅ 95% COMPLETE - Fully functional

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
- `/events/[id]` - Event details page
- `/services` - Services catalog (WORKING ✅)

#### ✅ Backend APIs (20+ endpoints)
```
Auth:     POST /api/auth/login, /api/auth/register
Events:   GET, POST, PUT, DELETE /api/events
          GET /api/events/:id/services
          POST /api/events/:id/services
          GET /api/events/:id/payments
Services: GET, POST, PUT, DELETE /api/services (PUBLIC ✅)
Payments: GET, POST, PUT, DELETE /api/payments
```

#### ✅ Database (Complete)
- 7 tables with relationships
- 5 stored procedures
- 7 user-defined functions
- 7 database views
- 8 triggers
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

### 2. Stored Procedures (5)

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

---

### 3. User-Defined Functions (7)

```sql
fn_calculate_event_cost(event_id)     → DECIMAL  -- Sum all service costs
fn_calculate_total_paid(event_id)     → DECIMAL  -- Sum all payments
fn_calculate_balance(event_id)        → DECIMAL  -- Cost - payments
fn_is_event_paid(event_id)            → TINYINT  -- Boolean check
fn_days_until_event(event_id)         → INT      -- Days remaining
fn_format_phone(phone)                → VARCHAR  -- Format phone number
fn_service_unit_total(qty, price)     → DECIMAL  -- Qty × price
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

### 4. Database Views (7)

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

---

### 5. Triggers (8)

**AFTER INSERT:**
- `tr_after_payment` - Logs payment creation
- `tr_after_event_service_add` - Recalculates event cost
- `tr_after_event_create` - Logs event creation
- `tr_after_service_create` - Logs service creation

**AFTER UPDATE:**
- `tr_after_event_status_update` - Logs status changes

**BEFORE DELETE:**
- `tr_before_event_delete` - Prevents deletion if payments exist
- `tr_before_user_delete` - Prevents deletion if user has events

**AFTER DELETE:**
- `tr_after_event_service_delete` - Recalculates cost

---

### 6. Indexes (30+)

```sql
-- Primary Keys (7)
PRIMARY KEY on all tables

-- Foreign Keys (10+)
idx_events_client_id, idx_events_event_type_id
idx_event_services_event_id, idx_event_services_service_id
idx_payments_event_id, idx_activity_logs_user_id

-- Status & Date (8)
idx_events_status, idx_events_event_date
idx_users_status, idx_payments_payment_date

-- Composite (5)
idx_events_client_status (client_id, status)
idx_events_date_status (event_date, status)

-- Full-Text (1)
idx_services_search FULLTEXT(service_name, description)
```

---

## 💻 Application Features (20% - 95% COMPLETE)

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

## 🧪 Testing Guide

### Testing Database Features

#### 1. Test Stored Procedures
```sql
-- Create event
CALL sp_create_event('Test Event', 1, 1, '2025-12-01', 'Hotel', 100, 500000, NULL, @event_id);
SELECT @event_id;

-- Process payment
CALL sp_process_payment(1, 100000, 'cash', NOW(), 'Test payment', @payment_id);
SELECT @payment_id;

-- Get event summary
CALL sp_get_event_summary(1);
```

#### 2. Test Functions
```sql
-- Calculate balance
SELECT 
  event_id,
  event_name,
  fn_calculate_event_cost(event_id) AS total_cost,
  fn_calculate_total_paid(event_id) AS paid,
  fn_calculate_balance(event_id) AS balance,
  fn_is_event_paid(event_id) AS is_paid
FROM events 
WHERE event_id = 1;
```

#### 3. Test Views
```sql
SELECT * FROM v_event_summary;
SELECT * FROM v_active_events;
SELECT * FROM v_payment_summary;
```

#### 4. Test Triggers
```sql
-- Insert payment and check log
INSERT INTO payments (event_id, amount, payment_method, payment_date)
VALUES (1, 50000, 'cash', NOW());

-- Check trigger logged it
SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 5;
```

### Testing APIs

#### Browser Console Test
```javascript
// Get token after login
const token = localStorage.getItem('auth_token');

// Test get events
fetch('/api/events', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);

// Test record payment
fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event_id: 1,
    amount: 100000,
    payment_method: 'cash'
  })
}).then(r => r.json()).then(console.log);
```

---

## 🎬 Demo Instructions

### 5-Minute Demo Script

**1. Login (30 sec)**
- Go to http://localhost:3000
- Login with: lakindu02@gmail.com / Test123
- Show dashboard with event statistics

**2. Browse Features (1 min)**
- Click "Services" in sidebar
- Show services catalog (public access)
- Filter by category

**3. View Event (1 min)**
- Go back to dashboard
- Click on an event card
- Show event details, services, payments

**4. Database Features (2.5 min)**
- Open MySQL Workbench
- Run: `CALL sp_get_event_summary(1);`
- Run: `SELECT * FROM v_event_summary;`
- Run: `SELECT fn_calculate_balance(1);`
- Show activity_logs table (trigger results)

**5. Wrap Up (30 sec)**
- Mention documentation
- Highlight 80% database focus

---

## 🔮 Future Work (Not Required for ADBMS)

### Optional Enhancements (5%)

1. **Payment Management Page** (2%)
   - Dedicated payments list page
   - Filter by event, method, date
   - Export to CSV

2. **Reports & Analytics** (2%)
   - Use existing database views
   - Charts and graphs
   - Monthly revenue report
   - Service usage report

3. **User Management** (1%)
   - Admin page to manage users
   - GET /api/users endpoint
   - Activate/deactivate users

### Why Not Implemented?
- **ADBMS focuses on database (80%)** - Already complete
- **Application is functional** - 95% complete
- **Time vs. Grade Impact** - Low priority

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

### ✅ Complete (95%)

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
