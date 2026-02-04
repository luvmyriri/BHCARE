"""
Database Migration Manager
Helps manage database schema changes across team members
"""
import os
import sys

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_section(text):
    print(f"\n📌 {text}")
    print("-" * 60)

print_header("🗄️ BHCARE Database Migration Manager")

print("""
This tool helps you manage database schema changes across your team.

Available Commands:
-------------------
1. Create Migration    - Create a new migration file
2. Apply Migrations    - Apply pending migrations to database
3. Check Status        - See which migrations are applied
4. Rollback           - Undo the last migration
5. History            - View all migrations
6. Help               - Show migration guide

""")

choice = input("Enter your choice (1-6): ").strip()

if choice == "1":
    print_section("Create New Migration")
    message = input("Enter migration description (e.g., 'add_phone_column'): ").strip()
    if message:
        print(f"\n🔨 Creating migration: {message}")
        os.system(f'python -m alembic revision -m "{message}"')
        print("\n✅ Migration file created!")
        print("📝 Edit the migration file in migrations/versions/")
        print("💡 Then run 'Apply Migrations' to apply it")
    else:
        print("❌ Migration description cannot be empty")

elif choice == "2":
    print_section("Apply Pending Migrations")
    print("🔨 Applying all pending migrations...")
    os.system('python -m alembic upgrade head')
    print("\n✅ Migrations applied!")

elif choice == "3":
    print_section("Check Migration Status")
    os.system('python -m alembic current')
    print("\n💡 To see all migrations, choose 'History'")

elif choice == "4":
    print_section("Rollback Last Migration")
    confirm = input("⚠️  Are you sure you want to rollback? (yes/no): ").strip().lower()
    if confirm == "yes":
        print("🔨 Rolling back last migration...")
        os.system('python -m alembic downgrade -1')
        print("\n✅ Rollback complete!")
    else:
        print("❌ Rollback cancelled")

elif choice == "5":
    print_section("Migration History")
    os.system('python -m alembic history')

elif choice == "6":
    print_section("Migration Guide")
    print("""
📚 How to Use Database Migrations:

1. WHEN SOMEONE ADDS A NEW COLUMN:
   - They create a migration: python manage_migrations.py → choice 1
   - They edit the migration file to add the column
   - They apply it: python manage_migrations.py → choice 2
   - They commit the migration file to Git
   - You pull from Git and run: python manage_migrations.py → choice 2

2. WORKFLOW FOR TEAM:
   Step 1: Pull latest code from Git
   Step 2: Run migrations: python manage_migrations.py → choice 2
   Step 3: Start developing
   Step 4: If you change database, create migration
   Step 5: Commit migration file to Git
   Step 6: Push to Git

3. IMPORTANT RULES:
   ✅ Always pull before creating new migrations
   ✅ Never edit old migration files
   ✅ Always commit migration files to Git
   ✅ Run migrations before starting work
   ✅ Test migrations before pushing

For detailed guide, see: docs/DATABASE_MIGRATIONS.md
    """)

else:
    print("❌ Invalid choice")

print("\n" + "=" * 60)
