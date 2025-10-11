# 🌲 Rosewood Event System

A full-stack event management system built with Nuxt 3, Vue 3, and MySQL. This project demonstrates advanced database features including stored procedures, triggers, views, functions, and comprehensive error handling.

## 🎯 Project Overview

**Purpose:** ADBMS (Advanced Database Management Systems) Project  
**Focus:** 80% Database Operations & Advanced Features  
**Stack:** Nuxt 3 + MySQL 8.0+

## ✨ Features

- 🔐 **Authentication System** - Login/Register with JWT
- 📅 **Event Management** - Create, view, and manage events
- 🛎️ **Service Selection** - Choose services for events
- 💳 **Payment Recording** - Track payments and transactions
- 📊 **Dashboard** - Overview of events and activities
- 🎨 **Dark Theme** - Zinc/Rose/Wooden color palette
- 📱 **Responsive Design** - Works on all devices

## 🗄️ Database Structure

The system uses **7 tables** with advanced MySQL features:

1. **users** - User accounts and authentication
2. **event_types** - Categories of events
3. **services** - Available services
4. **events** - Event bookings
5. **event_services** - Junction table for event-service relationship
6. **payments** - Payment transactions
7. **activity_logs** - System activity tracking

### Advanced DB Features (To be implemented)

- ✅ **Stored Procedures** - Complex operations
- ✅ **User-Defined Functions** - Calculations and validations
- ✅ **Views** - Simplified data access
- ✅ **Triggers** - Automated actions
- ✅ **Indexes** - Performance optimization
- ✅ **Error Handling** - Comprehensive error management

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

## 🔑 Default Test Accounts

After running seed data, you can use these accounts:

- **Admin:** admin@rosewood.com / Password123
- **Manager:** manager@rosewood.com / Password123
- **Client:** john.doe@email.com / Password123

⚠️ **Note:** Update password hashes in seed_data.sql before using!

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events (filtered by role)
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details (To be implemented)
- `PUT /api/events/:id` - Update event (To be implemented)
- `DELETE /api/events/:id` - Delete event (To be implemented)

## 🎯 Next Steps

1. ✅ Basic project setup
2. ✅ Database schema creation
3. ✅ Authentication system
4. ✅ Basic CRUD for events
5. ⏳ Implement stored procedures
6. ⏳ Create user-defined functions
7. ⏳ Add database views
8. ⏳ Implement triggers
9. ⏳ Create indexes
10. ⏳ Add comprehensive error handling
11. ⏳ Complete all CRUD operations
12. ⏳ Add service management
13. ⏳ Add payment system
14. ⏳ PWA configuration

## 🤝 Contributing

This is an academic project. For questions or improvements, please reach out to the project team.

## 📄 License

ISC License - Academic Project

---

**Built with ❤️ for ADBMS Project**
