"""create_appointments_table

Revision ID: 8096898f8f3f
Revises: f247b3e6830e
Create Date: 2026-02-04 00:26:09.089874

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8096898f8f3f'
down_revision: Union[str, Sequence[str], None] = 'c9dccf683a46'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create appointments table
    op.create_table(
        'appointments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('appointment_date', sa.Date(), nullable=False),
        sa.Column('appointment_time', sa.Time(), nullable=False),
        sa.Column('service_type', sa.String(length=100), nullable=False),
        sa.Column('doctor_preference', sa.String(length=100), nullable=True),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('cancelled_at', sa.DateTime(), nullable=True),
        sa.Column('cancellation_reason', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create index for faster queries
    op.create_index('idx_appointments_user_id', 'appointments', ['user_id'])
    op.create_index('idx_appointments_date', 'appointments', ['appointment_date'])
    op.create_index('idx_appointments_status', 'appointments', ['status'])
    
    # Create services table for available services
    op.create_table(
        'services',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=False, server_default='30'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create schedule_slots table for available time slots
    op.create_table(
        'schedule_slots',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),  # 0=Monday, 6=Sunday
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('max_appointments', sa.Integer(), nullable=False, server_default='5'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Insert default services
    op.execute("""
        INSERT INTO services (name, description, duration_minutes) VALUES
        ('General Consultation', 'General health check-up and consultation', 30),
        ('Prenatal Care', 'Prenatal check-up for pregnant women', 45),
        ('Immunization', 'Vaccination and immunization services', 20),
        ('Family Planning', 'Family planning consultation and services', 30),
        ('Dental Care', 'Basic dental check-up and treatment', 40),
        ('Laboratory Services', 'Blood tests and other laboratory services', 30),
        ('TB DOTS', 'Tuberculosis treatment and monitoring', 30),
        ('Nutrition Counseling', 'Nutritional assessment and counseling', 30)
    """)
    
    # Insert default schedule slots (Monday to Friday, 8 AM to 5 PM)
    op.execute("""
        INSERT INTO schedule_slots (day_of_week, start_time, end_time, max_appointments) VALUES
        (0, '08:00', '12:00', 5),
        (0, '13:00', '17:00', 5),
        (1, '08:00', '12:00', 5),
        (1, '13:00', '17:00', 5),
        (2, '08:00', '12:00', 5),
        (2, '13:00', '17:00', 5),
        (3, '08:00', '12:00', 5),
        (3, '13:00', '17:00', 5),
        (4, '08:00', '12:00', 5),
        (4, '13:00', '17:00', 5)
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('idx_appointments_status', table_name='appointments')
    op.drop_index('idx_appointments_date', table_name='appointments')
    op.drop_index('idx_appointments_user_id', table_name='appointments')
    op.drop_table('schedule_slots')
    op.drop_table('services')
    op.drop_table('appointments')
