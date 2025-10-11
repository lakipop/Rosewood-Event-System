# 🌲 Rosewood Event System

> Event management system with MySQL ADBMS features (80%) and minimal UI (20%).

**Developer:** ADBMS Team  | **Email:** lakindu02@gmail.com

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

============================================================
TOTAL ADBMS FEATURES: 45
============================================================

### App 

- Nuxt 3 + Vue 3 + Tailwind CSS
- JWT Authentication
- Dashboard
- Events CRUD
- Services Catalog
- Payment Tracking

---

## 🛠️ Stack

- **Frontend:** Nuxt 3, Vue 3, Tailwind, Nuxt/UI
- **Backend:** Nitro, MySQL 8+, JWT
- **State:** Pinia

---

## 📁 Structure

```
database/          # SQL (procedures, functions, views, triggers)
server/api/        # Backend APIs
pages/             # Frontend (dashboard, events, services, payments)
components/        # Vue components
stores/            # State management
```

---

## 📚 Docs

- **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** - Complete setup, API reference, testing
- **[ANALYSIS.md](ANALYSIS.md)** - Current status, issues, roadmap

---
See ANALYSIS.md for improvement plan.
