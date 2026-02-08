"""
Database Migration Helper Script
Simplified interface for creating and managing database migrations
"""
import os
import sys
from datetime import datetime

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_section(text):
    print(f"\n📌 {text}")
    print("-" * 70)

print_header("🗄️ BHCARE Migration Helper")

print("""
Quick Migration Commands:
------------------------
1. Create New Migration
2. Apply All Migrations
3. Check Migration Status
4. Rollback Last Migration
5. View Migration History
6. Generate SQL (Offline Mode)
7. Exit

""")

choice = input("Enter your choice (1-7): ").strip()

if choice == "1":
    print_section("Create New Migration")
    message = input("Migration description (e.g., 'add_user_role_column'): ").strip()
    if message:
        print(f"\n🔨 Creating migration: {message}")
        os.system(f'python -m alembic revision -m "{message}"')
        print("\n✅ Migration file created!")
        print("📝 Edit the file in migrations/versions/")
        print("💡 Then run option 2 to apply it")
    else:
        print("❌ Description cannot be empty")

elif choice == "2":
    print_section("Apply All Pending Migrations")
    confirm = input("⚠️  This will modify the database. Continue? (yes/no): ").strip().lower()
    if confirm == "yes":
        print("🔨 Applying migrations...")
        os.system('python -m alembic upgrade head')
        print("\n✅ Migrations applied!")
    else:
        print("❌ Cancelled")

elif choice == "3":
    print_section("Current Migration Status")
    os.system('python -m alembic current')
    print("\n💡 Use option 5 to see all migrations")

elif choice == "4":
    print_section("Rollback Last Migration")
    confirm = input("⚠️  This will undo the last migration. Continue? (yes/no): ").strip().lower()
    if confirm == "yes":
        print("🔨 Rolling back...")
        os.system('python -m alembic downgrade -1')
        print("\n✅ Rollback complete!")
    else:
        print("❌ Cancelled")

elif choice == "5":
    print_section("Migration History")
    os.system('python -m alembic history --verbose')

elif choice == "6":
    print_section("Generate SQL (Offline Mode)")
    print("This generates SQL without executing it")
    target = input("Target revision (or 'head' for all): ").strip() or "head"
    output_file = f"migration_sql_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sql"
    print(f"\n🔨 Generating SQL to {output_file}...")
    os.system(f'python -m alembic upgrade {target} --sql > {output_file}')
    print(f"\n✅ SQL saved to {output_file}")

elif choice == "7":
    print("👋 Goodbye!")
    sys.exit(0)

else:
    print("❌ Invalid choice")

print("\n" + "=" * 70)
