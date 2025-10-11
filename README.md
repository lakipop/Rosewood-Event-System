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

**Login:** `lakindu02@gmail.com` / `Test123`

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

## 🎯 ADBMS Compliance

| Requirement | Expected | Delivered | Status |
|-------------|----------|-----------|--------|
| Tables | 5+ | 7 | ✅ 140% |
| Procedures | 3+ | 5 | ✅ 167% |
| Functions | 3+ | 7 | ✅ 233% |
| Views | 3+ | 7 | ✅ 233% |
| Triggers | 3+ | 8 | ✅ 267% |
| Indexes | Required | 30+ | ✅ |

**Ready for Submission** ✅

---

**Developer:** Lakindu Akash | **Email:** lakindu02@gmail.com | **Date:** October 2025

DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rosewood_events
DB_PORT=3306

JWT_SECRET=your-super-secret-jwt-key-change-this

NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
Rosewood-Event-System/
├── assets/css/              # Tailwind CSS
├── components/              # Vue components
│   ├── auth/               # Authentication components
│   ├── events/             # Event components
│   ├── services/           # Service components
│   ├── payments/           # Payment components
│   └── common/             # Shared components
├── database/               # Database scripts
│   ├── schema/            # Table definitions
│   ├── procedures/        # Stored procedures
│   ├── functions/         # User-defined functions
│   ├── views/             # Database views
│   ├── triggers/          # Triggers
│   ├── indexes/           # Index definitions
│   └── seed_data.sql      # Sample data
├── layouts/               # Layout components
├── pages/                 # Route pages
├── server/                # Backend API
│   ├── api/              # API routes
│   ├── db/               # Database connection
│   ├── middleware/       # Auth middleware
│   └── utils/            # Utilities
├── stores/               # Pinia state management
└── nuxt.config.ts        # Nuxt configuration
```

## 🎨 Tech Stack

### Frontend
- **Nuxt 3** - Full-stack Vue framework
- **Vue 3** - UI framework (Composition API)
- **Tailwind CSS** - Utility-first styling
- **Nuxt UI** - Pre-built components
- **Nuxt Icons** - Icon library
- **Pinia** - State management

### Backend
- **Nitro** - Nuxt's server engine
- **mysql2** - MySQL driver
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Database
- **MySQL 8.0+** - Relational database

## 🔑 Sample Login Accounts

After running `node insert-sample-data.js`, use these accounts:

**Your Account:**
- Email: lakindu02@gmail.com
- Password: [Your registered password]

**Test Accounts (Password: Test123):**
- **Admin:** ruwan.bandara@gmail.com
- **Manager:** dilshan.fernando@gmail.com
- **Client:** kamal.perera@gmail.com

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events (role-based filtering)
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details with services and payments
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event (with payment validation)

### Services
- `GET /api/services` - Get all services (with category filter)
- `POST /api/services` - Create new service (admin/manager only)
- `PUT /api/services/:id` - Update service (admin/manager only)
- `DELETE /api/services/:id` - Delete service (admin only, validates usage)

## 🛠️ Database Scripts

Execute these SQL files in MySQL Workbench in order:

1. **Schema:** `database/schema/create_tables.sql` - Create all 7 tables
2. **Indexes:** `database/indexes/all_indexes.sql` - Create 30+ performance indexes
3. **Functions:** `database/functions/all_functions.sql` - 7 user-defined functions
4. **Procedures:** `database/procedures/all_procedures.sql` - 5 stored procedures
5. **Views:** `database/views/all_views.sql` - 7 database views
6. **Triggers:** `database/triggers/all_triggers.sql` - 8 automated triggers

**Or use Node scripts:**
- `node test-db-connection.js` - Test database connectivity
- `node generate-password-hash.js` - Generate bcrypt password hashes
- `node insert-sample-data.js` - Insert 10+ records in each table

## 🎯 Implementation Status

### ✅ Completed Features

**Backend (80% - Database Focus):**
- ✅ Complete database schema with constraints and foreign keys
- ✅ 5 Stored procedures with error handling and transactions
- ✅ 7 User-defined functions for calculations
- ✅ 7 Database views for reporting
- ✅ 8 Triggers for automation and logging
- ✅ 30+ Indexes (single, composite, full-text)
- ✅ Complete Events API (GET, POST, PUT, DELETE)
- ✅ Complete Services API (GET, POST, PUT, DELETE)
- ✅ JWT authentication with role-based access
- ✅ Bcrypt password hashing
- ✅ Sample data with Sri Lankan theme (100+ records)

**Frontend (20% - UI):**
- ✅ Authentication pages (Login, Register)
- ✅ Dashboard with event overview
- ✅ Services management page
- ✅ Dark theme with Tailwind CSS
- ✅ Responsive layouts
- ✅ Role-based UI components

### ⏳ Future Enhancements

- Event details page with service assignment
- Payment recording interface
- Advanced reporting dashboards
- Real-time notifications
- PWA configuration
- Email notifications
- File uploads for event photos
- Calendar view for events

## 🤝 Contributing

This is an academic project. For questions or improvements, please reach out to the project team.

## 📄 License

ISC License - Academic Project

---

**Built with ❤️ for ADBMS Project**
