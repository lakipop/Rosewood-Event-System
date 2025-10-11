# Rosewood Event System - Setup Guide

## 📋 Quick Start Checklist

- [ ] Node.js 18+ installed
- [ ] MySQL 8.0+ installed and running
- [ ] Database created (rosewood_events)
- [ ] Tables created from schema
- [ ] .env file configured
- [ ] Dependencies installed (npm install)

## 🔧 Step-by-Step Setup

### 1. Database Setup

Open MySQL Workbench or MySQL CLI and run:

```sql
CREATE DATABASE IF NOT EXISTS rosewood_events;
USE rosewood_events;
```

Then execute the table creation script located at:
`database/schema/create_tables.sql`

### 2. Environment Variables

Update the `.env` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=rosewood_events
DB_PORT=3306
JWT_SECRET=your-random-secret-key-here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

Visit: http://localhost:3000

### 5. Create Your First User

1. Navigate to http://localhost:3000/auth/register
2. Fill in the registration form
3. Login and start using the system!

## 🎯 What's Included in This Basic Setup

✅ **Completed:**
- Project structure
- Nuxt 3 configuration
- Database schema (7 tables)
- Authentication system (login/register)
- Basic event CRUD API
- Dashboard page
- Pinia state management
- Dark theme UI
- Responsive layouts

⏳ **To Be Implemented:**
- Stored procedures
- User-defined functions
- Database views (sample provided)
- Triggers (sample provided)
- Complete CRUD for all entities
- Service management
- Payment system
- Advanced error handling
- PWA features

## 🐛 Troubleshooting

### Database Connection Issues
- Check if MySQL is running
- Verify credentials in .env file
- Ensure database exists

### TypeScript Errors
- Run `npm run dev` once to generate .nuxt folder
- Errors in IDE are normal until first build

### Port Already in Use
- Change port: `PORT=3001 npm run dev`

## 📚 Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate
```

## 🎓 For Your ADBMS Project

Focus on implementing these advanced DB features:

1. **Stored Procedures** (database/procedures/)
   - Event creation with services
   - Payment processing
   - Bulk operations

2. **Functions** (database/functions/)
   - Cost calculations
   - Date validations
   - Status checks

3. **Views** (database/views/)
   - Event summaries
   - Payment reports
   - User statistics

4. **Triggers** (database/triggers/)
   - Auto-logging
   - Status updates
   - Data validation

5. **Indexes** (database/indexes/)
   - Query optimization
   - Performance tuning

Good luck with your project! 🚀
