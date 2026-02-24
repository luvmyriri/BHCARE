"""add bmi and bp logs

Revision ID: e5481e5e6e15
Revises: 33c27be9e989
Create Date: 2026-02-22 18:03:23.291877

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5481e5e6e15'
down_revision: Union[str, Sequence[str], None] = '33c27be9e989'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('bmi_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('weight', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('height', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('bmi', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('unit_system', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('bp_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('systolic', sa.Integer(), nullable=False),
        sa.Column('diastolic', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('bp_logs')
    op.drop_table('bmi_logs')
