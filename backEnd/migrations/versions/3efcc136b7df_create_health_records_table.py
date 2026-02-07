"""create_health_records_table

Revision ID: 3efcc136b7df
Revises: 01b8bbf711cf
Create Date: 2026-02-07 19:51:16.547215

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3efcc136b7df'
down_revision: Union[str, Sequence[str], None] = '01b8bbf711cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create health_records table for patient medical history."""
    op.create_table(
        'health_records',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('record_date', sa.Date(), nullable=False),
        sa.Column('record_type', sa.String(length=100), nullable=False),
        sa.Column('diagnosis', sa.Text(), nullable=True),
        sa.Column('treatment', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('doctor_name', sa.String(length=100), nullable=True),
        sa.Column('vital_signs', sa.JSON(), nullable=True),
        sa.Column('prescriptions', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for faster queries
    op.create_index('idx_health_records_user_id', 'health_records', ['user_id'])
    op.create_index('idx_health_records_record_date', 'health_records', ['record_date'])
    op.create_index('idx_health_records_record_type', 'health_records', ['record_type'])


def downgrade() -> None:
    """Drop health_records table."""
    op.drop_index('idx_health_records_record_type', table_name='health_records')
    op.drop_index('idx_health_records_record_date', table_name='health_records')
    op.drop_index('idx_health_records_user_id', table_name='health_records')
    op.drop_table('health_records')
