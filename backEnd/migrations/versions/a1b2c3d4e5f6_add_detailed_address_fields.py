"""add_detailed_address_fields

Revision ID: a1b2c3d4e5f6
Revises: 8096898f8f3f
Create Date: 2026-02-04 13:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '8096898f8f3f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add detailed address fields to users table."""
    # Add detailed street address columns
    op.add_column('users', sa.Column('house_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('block_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('lot_number', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('street_name', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('subdivision', sa.String(100), nullable=True))
    op.add_column('users', sa.Column('zip_code', sa.String(10), nullable=True))
    op.add_column('users', sa.Column('full_address', sa.String(500), nullable=True))


def downgrade() -> None:
    """Remove detailed address fields from users table."""
    op.drop_column('users', 'full_address')
    op.drop_column('users', 'zip_code')
    op.drop_column('users', 'subdivision')
    op.drop_column('users', 'street_name')
    op.drop_column('users', 'lot_number')
    op.drop_column('users', 'block_number')
    op.drop_column('users', 'house_number')
