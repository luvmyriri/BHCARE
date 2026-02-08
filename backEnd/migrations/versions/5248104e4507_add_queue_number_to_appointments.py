"""add_queue_number_to_appointments

Revision ID: 5248104e4507
Revises: ff96e673d46b
Create Date: 2026-02-09 02:33:53.217735

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5248104e4507'
down_revision: Union[str, Sequence[str], None] = 'ff96e673d46b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add queue_number to appointments table."""
    op.add_column('appointments', sa.Column('queue_number', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove queue_number from appointments table."""
    op.drop_column('appointments', 'queue_number')
