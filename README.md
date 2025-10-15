# 🌲 Rosewood Event System

> Event management system with MySQL ADBMS features (80%) and minimal UI (20%).

**Developer:** ADBMS Team No. ?  | **Email:** lakindu02@gmail.com

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

**URL:** http://localhost:3000

---

## 🔑 Login

| Email | Password | Role |
|-------|----------|------|
| lakindu02@gmail.com | (yours) | Admin |
| ruwan.bandara@gmail.com | Test123 | Admin |
| dilshan.fernando@gmail.com | Test123 | Manager |
| kamal.perera@gmail.com | Test123 | Client |

---

## ✨ Features

### Database Features

✅ 8 Stored Procedures
✅ 11 Functions
✅ 15 Views
✅ 11 Triggers (auto-running)

📊 Stored Procedures: 8
   - sp_add_event_service
   - sp_clone_event
   - sp_create_event
   - sp_generate_monthly_report
   - sp_get_event_summary
   - sp_process_payment
   - sp_reconcile_payments
   - sp_update_event_status

🔧 User-Defined Functions: 11
   - fn_calculate_balance
   - fn_calculate_client_ltv
   - fn_calculate_event_cost
   - fn_calculate_total_paid
   - fn_days_until_event
   - fn_event_profitability
   - fn_forecast_monthly_revenue
   - fn_format_phone
   - fn_is_event_paid
   - fn_payment_status
   - fn_service_unit_total

📈 Views: 15
   - v_event_pipeline
   - v_category_performance
   - v_payment_behavior
   - v_upcoming_events_risk
   - v_staff_performance
   - v_event_summary
   - v_active_events
   - v_upcoming_events
   - v_service_stats
   - v_payment_summary
   - v_user_activity
   - v_monthly_revenue
   - v_service_profitability
   - v_revenue_trends
   - v_client_segments

⚡ Triggers: 11
   - tr_after_payment_insert
   - tr_after_payment_update
   - tr_update_event_status_on_payment
   - tr_after_event_insert
   - tr_after_event_status_update
   - tr_after_service_add
   - tr_before_payment_insert
   - tr_before_payment_insert_date
   - tr_cascade_event_cancellation
   - tr_generate_payment_reference
   - tr_budget_overrun_warning

TOTAL ADBMS FEATURES: 45


### App Features

- Nuxt 3 + Vue 3 + Tailwind CSS with Glass Morphism
- JWT Authentication
- Responsive Layout with YouTube-style Sidebar Toggle
- Dashboard with Stats & Upcoming Events Widget
- Events CRUD with Status Management
- Services Catalog
- Payment Tracking

#### Phase 1: User Management ✅

- User CRUD operations
- Role-based access control (Admin, Manager, Client)
- Authentication & Authorization

#### Phase 2: Advanced Reports ✅

- Revenue Trends Analysis
- Service Profitability Reports
- Client Segmentation Dashboard

#### Phase 4: Monitoring & Workflow ✅

- **Activity Logs:** Complete audit trail with filtering (action, table, date)
- **Upcoming Events:** Proactive alerts for events within 7 days
- **Status Management:** Quick event status updates with cascade cancellation

---

## 🛠️ Stack

- **Frontend:** Nuxt 3, Vue 3, Tailwind, Nuxt/UI
- **Backend:** Nitro, MySQL 8+, JWT
- **State:** Pinia

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
│   │   ├── events/                # Events CRUD + services + payments + status
│   │   ├── services/              # Services CRUD
│   │   ├── payments/              # Payments CRUD
│   │   ├── activity-logs.get.ts   # Activity logs API
│   │   ├── upcoming-events.get.ts # Upcoming events API
│   │   └── reports/               # Revenue, profitability, segments
│   ├── middleware/
│   │   └── auth.ts                # JWT verification
│   ├── db/
│   │   └── connection.ts          # MySQL connection
│   └── utils/
│       ├── jwt.ts                 # Token generation
│       └── validation.ts          # Input validation
│
├── 🎨 pages/                       # Frontend
│   ├── index.vue                  # Dashboard + Upcoming Events Widget
│   ├── activity-logs.vue          # Activity logs viewer with filters
│   ├── auth/
│   │   ├── login.vue              # Login page
│   │   └── register.vue           # Registration
│   ├── events/
│   │   ├── index.vue              # Events listing
│   │   ├── [id].vue               # Event details + status update
│   │   └── create.vue             # Create event
│   ├── services/
│   │   └── index.vue              # Services catalog
│   ├── payments/
│   │   └── index.vue              # Payments listing
│   ├── users/
│   │   └── index.vue              # User management
│   └── reports/
│       ├── revenue-trends.vue     # Revenue analysis
│       ├── service-profitability.vue # Service performance
│       └── client-segments.vue    # Client segmentation
│
├── 🧩 components/
│   └── common/
│       ├── AppHeader.vue          # Header with glass morphism + toggle
│       └── AppSidebar.vue         # Sidebar with YouTube-style behavior
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

## 📚 Docs
- **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** - Complete setup, API reference, testing
- **[ADBMS_PHASE_1.md](ADBMS_PHASE_1.md)** - User Management implementation
- **[ADBMS_PHASE_2.md](ADBMS_PHASE_2.md)** - Advanced Reports implementation
- **[ADBMS_PHASE_4.md](ADBMS_PHASE_4.md)** - Monitoring & Workflow implementation
- **[WEB_APP_IMPLEMENTATION_PLAN.md](WEB_APP_IMPLEMENTATION_PLAN.md)** - Complete implementation roadmap

---

## 🎯 System Status

**Completed Phases:**
- ✅ Phase 1: User Management (CRUD, roles, auth)
- ✅ Phase 2: Advanced Reports (revenue, profitability, segments)
- ✅ Phase 4: Monitoring & Workflow (activity logs, alerts, status updates)

**Database:**
- 45 ADBMS features fully integrated
- All triggers auto-running
- Views optimized for reporting

**Note:** Phase 3 (Advanced Features) skipped - not required for current scope.

---
See ANALYSIS.md for improvement plan.
