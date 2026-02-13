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
    # Columns are already created in c9dccf683a46 which now runs before this
    pass


def downgrade() -> None:
    """Remove detailed address fields from users table."""
    pass
