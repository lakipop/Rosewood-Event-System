# 🌲 Rosewood Event System

A full-stack event management system built with Nuxt 3, Vue 3, and MySQL. This project demonstrates advanced database features including stored procedures, triggers, views, functions, and comprehensive error handling.

## 🎯 Project Overview

**Purpose:** ADBMS (Advanced Database Management Systems) Project  
**Focus:** 80% Database Operations & Advanced Features  
**Stack:** Nuxt 3 + MySQL 8.0+

## ✨ Features

- 🔐 **Authentication System** - Login/Register with JWT & bcrypt password hashing
- 📅 **Event Management** - Full CRUD operations for events
- 🛎️ **Service Management** - Complete service catalog with categories
- 💳 **Payment Recording** - Track payments and transactions
- 📊 **Dashboard** - Overview of events and activities
- 🎨 **Dark Theme** - Beautiful Zinc/Rose/Wooden color palette
- 📱 **Responsive Design** - Works on all devices
- 🔍 **Advanced DB Features** - Procedures, Functions, Views, Triggers, Indexes

## 🗄️ Database Structure

The system uses **7 tables** with advanced MySQL features:

1. **users** - User accounts and authentication (bcrypt passwords)
2. **event_types** - 10 Sri Lankan event categories
3. **services** - 10 traditional Sri Lankan services
4. **events** - Event bookings with full tracking
5. **event_services** - Junction table for event-service relationship
6. **payments** - Payment transactions with multiple types
7. **activity_logs** - Complete system activity audit trail

### Advanced DB Features ✅ IMPLEMENTED

- ✅ **Stored Procedures** (5) - Event creation, service assignment, payment processing, status updates, summaries
- ✅ **User-Defined Functions** (7) - Cost calculations, payment tracking, date utilities, phone formatting
- ✅ **Views** (7) - Event summaries, active events, service stats, payment summaries, revenue reports
- ✅ **Triggers** (8) - Activity logging, payment validation, status automation, deletion prevention
- ✅ **Indexes** (30+) - Single, composite, and full-text indexes for optimal performance
- ✅ **Error Handling** - Comprehensive error management in all operations

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create the database:
```sql
CREATE DATABASE rosewood_events;
USE rosewood_events;
```

2. Run the table creation script:
```bash
# In MySQL Workbench or CLI, execute:
database/schema/create_tables.sql
```

3. (Optional) Insert seed data:
```bash
# Execute in MySQL:
database/seed_data.sql
```

### 3. Environment Configuration

Update the `.env` file with your database credentials:

```env
DB_HOST=localhost
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
