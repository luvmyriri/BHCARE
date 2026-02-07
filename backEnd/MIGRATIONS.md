# Database Migrations Guide

## Overview

This project uses **Alembic** for database migrations. All schema changes must go through migrations to ensure consistency across team members and environments.

## Quick Start

### Apply All Migrations
```powershell
cd backEnd
python -m alembic upgrade head
```

### Create a New Migration
```powershell
python create_migration.py
# Or directly:
python -m alembic revision -m "your_migration_description"
```

### Check Migration Status
```powershell
python -m alembic current
```

## Migration Files

### Current Migrations (in order)

1. **f247b3e6830e** - Initial migration (empty placeholder)
2. **8096898f8f3f** - Create appointments, services, and schedule_slots tables
3. **a1b2c3d4e5f6** - Add detailed address fields to users table
4. **c9dccf683a46** - Create users table with all registration fields
5. **01b8bbf711cf** - Create admin_users table with default admin
6. **3efcc136b7df** - Create health_records table for medical history
7. **e05c655a5ea2** - Create audit_log table for activity tracking

### Table Schemas

#### Users Table
- Patient registration information
- Personal details (name, DOB, gender, contact)
- Complete address fields (barangay, city, province, street details)
- OCR data storage (ID image, extracted text)

#### Admin Users Table
- Administrative access control
- Default admin account (username: `admin`, password: `admin123`)
- Role-based permissions
- Login tracking

#### Health Records Table
- Patient medical history
- Diagnosis and treatment records
- Vital signs and prescriptions (JSON format)
- Doctor notes and record types

#### Audit Log Table
- System activity tracking
- Change history with old/new values (JSONB)
- User and admin action logging
- IP address and user agent tracking

## Common Commands

### View Migration History
```powershell
python -m alembic history --verbose
```

### Rollback Last Migration
```powershell
python -m alembic downgrade -1
```

### Upgrade to Specific Revision
```powershell
python -m alembic upgrade <revision_id>
```

### Generate SQL Without Executing
```powershell
python -m alembic upgrade head --sql > migration.sql
```

## Team Workflow

### When Pulling Changes
1. Pull latest code from Git
2. Run migrations: `python -m alembic upgrade head`
3. Start developing

### When Making Schema Changes
1. Pull latest code first
2. Create migration: `python create_migration.py`
3. Edit the migration file in `migrations/versions/`
4. Test the migration locally
5. Commit the migration file to Git
6. Push to Git

## Important Rules

✅ **DO:**
- Always use migrations for schema changes
- Test migrations before committing
- Write both upgrade() and downgrade() functions
- Commit migration files to Git
- Pull and apply migrations before starting work

❌ **DON'T:**
- Modify existing migration files
- Create tables directly in database.py
- Skip migrations when making schema changes
- Delete migration files
- Modify the database schema manually

## Troubleshooting

### "Table already exists" Error
If tables were created by `database.py` before migrations:
```powershell
# Option 1: Mark migrations as applied (if schema matches)
python -m alembic stamp head

# Option 2: Drop and recreate (CAUTION: loses data)
# Drop database, recreate, then run migrations
python -m alembic upgrade head
```

### Migration Conflicts
If you get revision conflicts:
1. Pull latest code
2. Check `alembic history`
3. Your migration should build on the latest revision
4. If needed, create a new migration with correct parent

### Reset Migrations (Development Only)
```powershell
# CAUTION: This deletes all data
python -m alembic downgrade base
python -m alembic upgrade head
```

## Configuration

- **alembic.ini** - Alembic configuration
- **migrations/env.py** - Environment setup (reads from .env)
- **migrations/versions/** - Migration files
- **.env** - Database credentials (not in Git)

## Database Connection

Migrations use the same database connection as the application:
- Host: `DB_HOST` (default: localhost)
- Port: `DB_PORT` (default: 5432)
- Database: `DB_NAME` (default: bhcare)
- User: `DB_USER` (default: postgres)
- Password: `DB_PASSWORD` (from .env)

## Helper Scripts

- **create_migration.py** - Interactive migration helper
- **manage_migrations.py** - Legacy migration manager
- **test_connection.py** - Test database connectivity
