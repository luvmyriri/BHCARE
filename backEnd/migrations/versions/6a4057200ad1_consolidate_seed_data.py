"""consolidate_seed_data

Revision ID: 6a4057200ad1
Revises: 5248104e4507
Create Date: 2026-02-09 15:19:52.524225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6a4057200ad1'
down_revision: Union[str, Sequence[str], None] = '5248104e4507'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Consolidated seed data for all tables."""
    # 1. Services
    # We use raw execute for tables created in previous migrations to avoid circular imports or metadata issues
    op.execute("""
        INSERT INTO services (id, name, description, duration_minutes, is_active) VALUES
        (1, 'General Consultation', 'General health check-up and consultation', 30, true),
        (2, 'Prenatal Care', 'Prenatal check-up for pregnant women', 45, true),
        (3, 'Immunization', 'Vaccination and immunization services', 20, true),
        (4, 'Family Planning', 'Family planning consultation and services', 30, true),
        (5, 'Dental Care', 'Basic dental check-up and treatment', 40, true),
        (6, 'Laboratory Services', 'Blood tests and other laboratory services', 30, true),
        (7, 'TB DOTS', 'Tuberculosis treatment and monitoring', 30, true),
        (8, 'Nutrition Counseling', 'Nutritional assessment and counseling', 30, true)
        ON CONFLICT (id) DO NOTHING
    """)

    # 2. Schedule Slots
    op.execute("""
        INSERT INTO schedule_slots (id, day_of_week, start_time, end_time, max_appointments, is_active) VALUES
        (1, 0, '08:00:00', '12:00:00', 5, true),
        (2, 0, '13:00:00', '17:00:00', 5, true),
        (3, 1, '08:00:00', '12:00:00', 5, true),
        (4, 1, '13:00:00', '17:00:00', 5, true),
        (5, 2, '08:00:00', '12:00:00', 5, true),
        (6, 2, '13:00:00', '17:00:00', 5, true),
        (7, 3, '08:00:00', '12:00:00', 5, true),
        (8, 3, '13:00:00', '17:00:00', 5, true),
        (9, 4, '08:00:00', '12:00:00', 5, true),
        (10, 4, '13:00:00', '17:00:00', 5, true)
        ON CONFLICT (id) DO NOTHING
    """)

    # 3. Users (Seeding the ones found in current DB)
    op.execute("""
        INSERT INTO users (id, email, password_hash, first_name, middle_name, last_name, date_of_birth, gender, contact_number, barangay, city, province, house_number, block_number, lot_number, street_name, subdivision, zip_code, full_address) VALUES
        (1, 'juan.delacruz@example.com', 'hashed_password', 'Juan', NULL, 'Dela Cruz', '1980-01-01', 'Male', '09171234567', '174', 'Caloocan', 'Metro Manila', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
        (2, 'genetabios13@gmail.com', '$2b$12$lvaUwbGKldJPJ1QLoOB44.AMHPYzxRDlzx49mrU5OF6kbR4r5fDZq', 'Gene', 'Gange', 'Tabios', '2005-06-13', 'Male', '+639614331761', 'Barangay 171', 'Caloocan City', 'Metro Manila', '', 'Block 9', 'Lot 30', 'Ruby', 'Ruby St Celina', '1421', 'BLK 9 LOT 30, RUBY ST CELINA HOMES 3 BAGUMBONG, BARANGAY 171, CALOOCAN CITY, NCR, THIRD DISTRICT, 1421 License No.'),
        (3, 'security1741@bhcare.ph', '$2b$12$eb1YN0bubS7TLjvPVithWO5IxKCyaE.BRRLVkX3HFW36PbhccPhv2', 'Security', NULL, 'Department', '1990-01-01', 'N/A', '+639000000000', '174', 'Caloocan', 'Metro Manila', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
        ON CONFLICT (id) DO NOTHING
    """)

    # 4. Admin Users
    op.execute("""
        INSERT INTO admin_users (id, username, password_hash, email, role, is_active) VALUES
        (1, 'admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTvQiOe', 'admin@bhcare.local', 'admin', true)
        ON CONFLICT (id) DO NOTHING
    """)

    # 5. Inventory
    op.execute("""
        INSERT INTO inventory (id, item_name, category, stock_quantity, unit, status, expiry_date) VALUES
        (1, 'Paracetamol 500mg', 'Medicine', 500, 'boxes', 'Good', '2026-12-31'),
        (2, 'Amoxicillin 500mg', 'Medicine', 50, 'pcs', 'Low Stock', '2025-10-15'),
        (3, 'Medical Alcohol 70%', 'Supplies', 150, 'bottles', 'Good', '2027-05-20')
        ON CONFLICT (id) DO NOTHING
    """)

    # 6. Lab Results
    op.execute("""
        INSERT INTO lab_results (id, patient_id, test_type, status, is_urgent, requested_at) VALUES
        (1, 1, 'Complete Blood Count (CBC)', 'pending', false, '2026-02-09 00:29:43'),
        (2, 1, 'Urinalysis', 'processing', false, '2026-02-09 00:29:43'),
        (3, 1, 'X-Ray (Chest)', 'pending', true, '2026-02-09 00:29:43')
        ON CONFLICT (id) DO NOTHING
    """)


def downgrade() -> None:
    """Downgrade schema (deleting seed data)."""
    # Note: Generally, we don't delete seed data in downgrade to avoid accidental data loss 
    # of things that might have been modified. But for completeness:
    op.execute("DELETE FROM lab_results WHERE id IN (1, 2, 3)")
    op.execute("DELETE FROM inventory WHERE id IN (1, 2, 3)")
    op.execute("DELETE FROM admin_users WHERE id = 1")
    op.execute("DELETE FROM users WHERE id IN (1, 2, 3)")
    op.execute("DELETE FROM schedule_slots WHERE id BETWEEN 1 AND 10")
    op.execute("DELETE FROM services WHERE id BETWEEN 1 AND 8")
