"""make_user_id_nullable_in_appointments

Revision ID: ff96e673d46b
Revises: cdcd43429a91
Create Date: 2026-02-09 02:28:08.630097

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ff96e673d46b'
down_revision: Union[str, Sequence[str], None] = 'cdcd43429a91'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make user_id nullable in appointments table."""
    op.alter_column('appointments', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    """Make user_id not nullable in appointments table."""
    op.alter_column('appointments', 'user_id',
               existing_type=sa.INTEGER(),
               nullable=False)
