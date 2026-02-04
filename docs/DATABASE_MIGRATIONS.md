# 🔄 Database Migrations Guide for Team Collaboration

## 🎯 The Problem We're Solving

**Before**: When someone adds a database column, everyone else has to manually update their database 😫

**Now**: Database changes are tracked in Git and applied automatically! 🎉

---

## 📚 What Are Database Migrations?

Think of migrations as **"Git for your database schema"**:
- Each database change is a "migration file"
- Migration files are committed to Git
- Team members pull and apply migrations automatically
- Everyone's database stays in sync!

---

## 🚀 Quick Start for Team Members

### First Time Setup (Do Once)

1. **Pull latest code** from Git
2. **Install Alembic**:
   ```powershell
   cd backEnd
   python -m pip install alembic
   ```
3. **Apply existing migrations**:
   ```powershell
   python manage_migrations.py
   # Choose option 2: Apply Migrations
   ```

That's it! Your database is now up to date.

---

## 📖 Daily Workflow

### When You Pull Code from Git

```powershell
# 1. Pull latest code
git pull

# 2. Apply any new migrations
cd backEnd
python manage_migrations.py
# Choose option 2: Apply Migrations

# 3. Start working!
python app.py
```

### When You Change the Database

**Example**: You want to add a `phone_verified` column

```powershell
# 1. Create a migration
python manage_migrations.py
# Choose option 1: Create Migration
# Enter description: "add_phone_verified_column"

# 2. Edit the migration file
# File created in: migrations/versions/xxxxx_add_phone_verified_column.py
```

**Edit the migration file**:
```python
def upgrade():
    op.add_column('users', sa.Column('phone_verified', sa.Boolean(), nullable=True))

def downgrade():
    op.drop_column('users', 'phone_verified')
```

```powershell
# 3. Apply the migration
python manage_migrations.py
# Choose option 2: Apply Migrations

# 4. Test it works
python test_connection.py

# 5. Commit to Git
git add migrations/
git commit -m "Add phone_verified column"
git push
```

---

## 🎯 Common Scenarios

### Scenario 1: Add a New Column

**Person A** wants to add `email_verified` column:

```powershell
# 1. Create migration
python manage_migrations.py → Create Migration
# Description: "add_email_verified"

# 2. Edit migration file (migrations/versions/xxxxx_add_email_verified.py)
```

```python
def upgrade():
    op.add_column('users', 
        sa.Column('email_verified', sa.Boolean(), 
                  server_default='false', nullable=False))

def downgrade():
    op.drop_column('users', 'email_verified')
```

```powershell
# 3. Apply and test
python manage_migrations.py → Apply Migrations

# 4. Commit to Git
git add migrations/
git commit -m "Add email_verified column"
git push
```

**Everyone else**:
```powershell
git pull
python manage_migrations.py → Apply Migrations
# Done! They now have the email_verified column
```

---

### Scenario 2: Modify Existing Column

**Person B** wants to make `middle_name` required:

```powershell
# 1. Create migration
python manage_migrations.py → Create Migration
# Description: "make_middle_name_required"

# 2. Edit migration file
```

```python
def upgrade():
    # First, fill NULL values with empty string
    op.execute("UPDATE users SET middle_name = '' WHERE middle_name IS NULL")
    # Then make it NOT NULL
    op.alter_column('users', 'middle_name',
                    existing_type=sa.VARCHAR(length=100),
                    nullable=False)

def downgrade():
    op.alter_column('users', 'middle_name',
                    existing_type=sa.VARCHAR(length=100),
                    nullable=True)
```

```powershell
# 3. Apply, test, commit
python manage_migrations.py → Apply Migrations
git add migrations/
git commit -m "Make middle_name required"
git push
```

---

### Scenario 3: Add a New Table

**Person C** wants to add `appointments` table:

```powershell
# 1. Create migration
python manage_migrations.py → Create Migration
# Description: "create_appointments_table"

# 2. Edit migration file
```

```python
def upgrade():
    op.create_table('appointments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('appointment_date', sa.DateTime(), nullable=False),
        sa.Column('doctor_name', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('appointments')
```

```powershell
# 3. Apply, test, commit
python manage_migrations.py → Apply Migrations
git add migrations/
git commit -m "Add appointments table"
git push
```

---

## 🛠️ Migration Manager Commands

Run: `python manage_migrations.py`

| Option | Command | When to Use |
|--------|---------|-------------|
| 1 | Create Migration | You're changing the database |
| 2 | Apply Migrations | After pulling from Git |
| 3 | Check Status | See current migration version |
| 4 | Rollback | Undo last migration (if mistake) |
| 5 | History | View all migrations |
| 6 | Help | Show guide |

---

## 🎯 Team Workflow Example

### Monday Morning

**Alice** (Developer 1):
```powershell
git pull
python manage_migrations.py → Apply Migrations
python app.py  # Start working
```

**Bob** (Developer 2):
```powershell
git pull
python manage_migrations.py → Apply Migrations
python app.py  # Start working
```

### Tuesday - Alice Adds Feature

**Alice** adds `profile_picture` column:
```powershell
python manage_migrations.py → Create Migration
# Edit migration file
python manage_migrations.py → Apply Migrations
git add migrations/
git commit -m "Add profile_picture column"
git push
```

### Wednesday - Bob Pulls Changes

**Bob** gets Alice's changes:
```powershell
git pull
python manage_migrations.py → Apply Migrations
# Now Bob has profile_picture column too!
```

---

## ⚠️ Important Rules

### ✅ DO:
- **Always pull before creating migrations**
- **Always apply migrations after pulling**
- **Commit migration files to Git**
- **Test migrations before pushing**
- **Write clear migration descriptions**
- **Include both upgrade() and downgrade()**

### ❌ DON'T:
- **Never edit old migration files** (create new ones instead)
- **Never delete migration files**
- **Never skip migrations**
- **Never manually change database without migration**
- **Never commit database files (.db, dumps)**

---

## 🔍 Checking Migration Status

### See Current Version
```powershell
python manage_migrations.py → Check Status
```

### See All Migrations
```powershell
python manage_migrations.py → History
```

### Manual Check
```powershell
python -m alembic current
python -m alembic history
```

---

## 🆘 Troubleshooting

### "Migration already applied"
**Solution**: You're up to date! No action needed.

### "Migration not found"
**Solution**: Pull latest code from Git
```powershell
git pull
python manage_migrations.py → Apply Migrations
```

### "Database out of sync"
**Solution**: Check migration status
```powershell
python manage_migrations.py → Check Status
python manage_migrations.py → History
```

### "Migration failed"
**Solution**: Rollback and fix
```powershell
python manage_migrations.py → Rollback
# Fix the migration file
python manage_migrations.py → Apply Migrations
```

### "Merge conflict in migrations"
**Solution**: This is rare, but if it happens:
1. Keep both migration files
2. Apply them in order
3. Create a new migration if needed

---

## 📝 Migration File Structure

Migration files are in: `migrations/versions/`

Example: `f247b3e6830e_add_email_verified.py`

```python
"""add_email_verified

Revision ID: f247b3e6830e
Revises: abc123def456
Create Date: 2026-02-03 23:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'f247b3e6830e'
down_revision = 'abc123def456'  # Previous migration
branch_labels = None
depends_on = None

def upgrade():
    # What to do when applying this migration
    op.add_column('users', 
        sa.Column('email_verified', sa.Boolean(), nullable=True))

def downgrade():
    # What to do when rolling back this migration
    op.drop_column('users', 'email_verified')
```

---

## 🎓 Common Migration Operations

### Add Column
```python
def upgrade():
    op.add_column('users', 
        sa.Column('new_column', sa.String(length=50), nullable=True))

def downgrade():
    op.drop_column('users', 'new_column')
```

### Modify Column
```python
def upgrade():
    op.alter_column('users', 'email',
                    existing_type=sa.VARCHAR(length=255),
                    type_=sa.String(length=320),
                    nullable=False)

def downgrade():
    op.alter_column('users', 'email',
                    existing_type=sa.String(length=320),
                    type_=sa.VARCHAR(length=255),
                    nullable=True)
```

### Rename Column
```python
def upgrade():
    op.alter_column('users', 'phone', new_column_name='contact_number')

def downgrade():
    op.alter_column('users', 'contact_number', new_column_name='phone')
```

### Add Index
```python
def upgrade():
    op.create_index('idx_users_email', 'users', ['email'])

def downgrade():
    op.drop_index('idx_users_email', table_name='users')
```

### Create Table
```python
def upgrade():
    op.create_table('new_table',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade():
    op.drop_table('new_table')
```

---

## 🎯 Best Practices

1. **One Change Per Migration**
   - ✅ Good: "add_email_verified_column"
   - ❌ Bad: "add_multiple_columns_and_change_types"

2. **Clear Descriptions**
   - ✅ Good: "add_profile_picture_url_column"
   - ❌ Bad: "update_users"

3. **Test Before Pushing**
   ```powershell
   python manage_migrations.py → Apply Migrations
   python test_connection.py
   python app.py  # Test the app
   ```

4. **Always Include Downgrade**
   - Every migration should be reversible
   - Test rollback works

5. **Communicate with Team**
   - Mention database changes in commit messages
   - Notify team in chat: "Pull and run migrations!"

---

## 📊 Migration Workflow Diagram

```
Developer A                    Git                    Developer B
-----------                    ---                    -----------
1. Create migration
2. Edit migration file
3. Apply migration
4. Test
5. Commit & Push  ────────────▶ Git Repo ────────────▶ 6. Pull
                                                        7. Apply migrations
                                                        8. Database updated!
```

---

## ✅ Quick Reference

### Daily Commands
```powershell
# After pulling code
python manage_migrations.py → Apply Migrations

# When changing database
python manage_migrations.py → Create Migration
# Edit migration file
python manage_migrations.py → Apply Migrations
git add migrations/
git commit -m "Description"
git push
```

### Check Status
```powershell
python manage_migrations.py → Check Status
python manage_migrations.py → History
```

### Emergency Rollback
```powershell
python manage_migrations.py → Rollback
```

---

## 🎉 Summary

**Before Migrations**:
- ❌ Manual database updates
- ❌ Everyone out of sync
- ❌ Lots of errors

**With Migrations**:
- ✅ Automatic database updates
- ✅ Everyone in sync
- ✅ Changes tracked in Git
- ✅ Easy rollback
- ✅ Professional workflow

**Remember**: 
1. Pull → Apply Migrations → Work
2. Change DB → Create Migration → Apply → Commit → Push
3. Team pulls → Applies migrations → Everyone in sync!

---

*For more help, run: `python manage_migrations.py` → Option 6*
