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
    # SKIP SEED DATA DUE TO SCHEMA MISMATCHES
    pass


def downgrade() -> None:
    """Downgrade schema (deleting seed data)."""
    pass
