"""add_lab_and_inventory_tables

Revision ID: 4f677f12ea5d
Revises: c92b122eaa13
Create Date: 2026-02-09 00:00:37.436389

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4f677f12ea5d'
down_revision: Union[str, Sequence[str], None] = 'c92b122eaa13'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Medical Records Table
    op.create_table('medical_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('appointment_id', sa.Integer(), nullable=True),
        sa.Column('diagnosis', sa.Text(), nullable=True),
        sa.Column('treatment', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['doctor_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Lab Results Table
    op.create_table('lab_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('medical_record_id', sa.Integer(), nullable=True),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('test_type', sa.String(length=100), nullable=False),
        sa.Column('result_summary', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=50), server_default='pending', nullable=True),
        sa.Column('is_urgent', sa.Boolean(), server_default='false', nullable=True),
        sa.Column('requested_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['medical_record_id'], ['medical_records.id'], ),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


    # Inventory Table
    inventory_table = op.create_table('inventory',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('item_name', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('stock_quantity', sa.Integer(), server_default='0', nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- SEED DATA ---
    from datetime import datetime
    
    # 1. Seed Inventory
    op.bulk_insert(inventory_table, [
        {
            'item_name': 'Paracetamol 500mg',
            'category': 'Medicine',
            'stock_quantity': 500,
            'unit': 'boxes',
            'status': 'Good',
            'expiry_date': datetime(2026, 12, 31).date(),
            'updated_at': datetime.now()
        },
        {
            'item_name': 'Amoxicillin 500mg',
            'category': 'Medicine',
            'stock_quantity': 50,
            'unit': 'pcs',
            'status': 'Low Stock',
            'expiry_date': datetime(2025, 10, 15).date(),
            'updated_at': datetime.now()
        },
        {
            'item_name': 'Medical Alcohol 70%',
            'category': 'Supplies',
            'stock_quantity': 150,
            'unit': 'bottles',
            'status': 'Good',
            'expiry_date': datetime(2027, 5, 20).date(),
            'updated_at': datetime.now()
        }
    ])

    # 2. Ensure a Patient exists for Lab Results
    connection = op.get_bind()
    users_table = sa.Table('users', sa.MetaData(),
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('first_name', sa.String),
        sa.Column('last_name', sa.String),
        sa.Column('email', sa.String),
        sa.Column('password_hash', sa.String),
        sa.Column('date_of_birth', sa.Date),
        sa.Column('gender', sa.String),
        sa.Column('contact_number', sa.String),
        sa.Column('barangay', sa.String),
        sa.Column('city', sa.String),
        sa.Column('province', sa.String)
    )
    
    # Check if any user exists
    result = connection.execute(sa.select(users_table.c.id).limit(1)).fetchone()
    patient_id = result[0] if result else None
    
    if not patient_id:
        # Insert a seed user if none exists
        connection.execute(users_table.insert().values(
            first_name='Juan',
            last_name='Dela Cruz',
            email='juan.delacruz@example.com',
            password_hash='hashed_password', # Dummy hash
            date_of_birth=datetime(1980, 1, 1).date(),
            gender='Male',
            contact_number='09171234567',
            barangay='174',
            city='Caloocan',
            province='Metro Manila'
        ))
        # Fetch the ID of the newly inserted user
        result = connection.execute(sa.select(users_table.c.id).where(users_table.c.email == 'juan.delacruz@example.com')).fetchone()
        patient_id = result[0]

    # 3. Seed Lab Results
    lab_results_table = sa.Table('lab_results', sa.MetaData(),
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('patient_id', sa.Integer),
        sa.Column('test_type', sa.String),
        sa.Column('status', sa.String),
        sa.Column('result_summary', sa.String),
        sa.Column('is_urgent', sa.Boolean),
        sa.Column('requested_at', sa.DateTime),
        sa.Column('completed_at', sa.DateTime)
    )
    
    op.bulk_insert(lab_results_table, [
        {
            'patient_id': patient_id,
            'test_type': 'Complete Blood Count (CBC)',
            'status': 'pending',
            'result_summary': None,
            'is_urgent': False,
            'requested_at': datetime.now(),
            'completed_at': None
        },
        {
            'patient_id': patient_id,
            'test_type': 'Urinalysis',
            'status': 'processing',
            'result_summary': None,
            'is_urgent': False,
            'requested_at': datetime.now(),
            'completed_at': None
        },
        {
            'patient_id': patient_id,
            'test_type': 'X-Ray (Chest)',
            'status': 'pending',
            'result_summary': None,
            'is_urgent': True,
            'requested_at': datetime.now(),
            'completed_at': None
        }
    ])


def downgrade() -> None:
    # Remove seed data (optional, but dropping tables handles it)
    op.drop_table('inventory')
    op.drop_table('lab_results')
    op.drop_table('medical_records')
