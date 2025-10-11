# 🌲 Rosewood Event System

A full-stack event management system for ADBMS course, demonstrating advanced MySQL database features.

**Status:** ✅ 95% Complete | **Grade:** 80% Database (Complete) + 20% App (95%)

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Setup Database
CREATE DATABASE rosewood_events;
mysql -u root -p rosewood_events < database/schema/create_tables.sql
mysql -u root -p rosewood_events < database/procedures/all_procedures.sql
mysql -u root -p rosewood_events < database/functions/all_functions.sql
mysql -u root -p rosewood_events < database/views/all_views.sql
mysql -u root -p rosewood_events < database/triggers/all_triggers.sql
mysql -u root -p rosewood_events < database/indexes/all_indexes.sql
mysql -u root -p rosewood_events < database/seed_data.sql

# 3. Configure (.env file)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rosewood_events
JWT_SECRET=your-secret-key

# 4. Run
npm run dev
```

## ✨ Features

- � Event Management - Full CRUD
- 🛠️ Services Catalog - Browse & manage
- 💰 Payment Tracking - Record & monitor
- 🔐 JWT Authentication - Role-based access
- 📊 Dashboard - Statistics & overview

## 🗄️ Database (ADBMS - 80%)

- **7 Tables** with relationships
- **5 Stored Procedures** - Event creation, payment processing, etc.
- **7 Functions** - Cost calculations, balance tracking
- **7 Views** - Event summaries, analytics
- **8 Triggers** - Auto-logging, validation
- **30+ Indexes** - Performance optimization
- **100+ Sample Records**

## 🛠️ Tech Stack

**Frontend:** Nuxt 3, Vue 3, Tailwind CSS  
**Backend:** Nuxt Server API, JWT  
**Database:** MySQL 8.0+  
**Security:** Bcrypt password hashing

## 📚 Documentation

See **[PROJECT_GUIDE.md](PROJECT_GUIDE.md)** for complete documentation:
- Database features reference
- API endpoints
- Testing instructions
- Demo guide
- Future enhancements

## � Structure

```
database/       # SQL scripts (procedures, functions, views, triggers)
server/api/     # Backend API endpoints
pages/          # Frontend pages
components/     # Vue components
stores/         # Pinia state management
```
## 🤝 Contributing
Contributions welcome! Please open issues or PRs for improvements.
