# 🚀 Database Migrations - Quick Reference Card

## 📋 Daily Workflow

### After Pulling from Git
```powershell
cd backEnd
python manage_migrations.py
# Choose: 2 (Apply Migrations)
```

### When You Change Database
```powershell
# 1. Create migration
python manage_migrations.py
# Choose: 1 (Create Migration)

# 2. Edit migration file in migrations/versions/

# 3. Apply migration
python manage_migrations.py
# Choose: 2 (Apply Migrations)

# 4. Commit to Git
git add migrations/
git commit -m "Add [description]"
git push
```

---

## 🎯 Common Commands

| Action | Steps |
|--------|-------|
| **Pull & Update** | `git pull` → `python manage_migrations.py` → Option 2 |
| **Create Migration** | `python manage_migrations.py` → Option 1 |
| **Apply Migrations** | `python manage_migrations.py` → Option 2 |
| **Check Status** | `python manage_migrations.py` → Option 3 |
| **View History** | `python manage_migrations.py` → Option 5 |
| **Rollback** | `python manage_migrations.py` → Option 4 |

---

## ✅ Rules to Remember

1. ✅ **Always pull before creating migrations**
2. ✅ **Always apply migrations after pulling**
3. ✅ **Always commit migration files to Git**
4. ✅ **Never edit old migration files**
5. ✅ **Test before pushing**

---

## 📝 Migration Template

```python
def upgrade():
    # Add your database changes here
    op.add_column('users', 
        sa.Column('new_column', sa.String(50), nullable=True))

def downgrade():
    # Reverse the changes
    op.drop_column('users', 'new_column')
```

---

## 🆘 Quick Fixes

**Problem**: Migration failed  
**Solution**: `python manage_migrations.py` → Option 4 (Rollback)

**Problem**: Out of sync  
**Solution**: `git pull` → `python manage_migrations.py` → Option 2

**Problem**: Forgot to apply migrations  
**Solution**: `python manage_migrations.py` → Option 2

---

## 📚 Full Guide

See: `docs/DATABASE_MIGRATIONS.md`

---

**Remember**: Pull → Migrate → Work → Create → Migrate → Commit → Push
