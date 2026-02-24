"""add suffix to users

Revision ID: 33c27be9e989
Revises: a389b03f26b4
Create Date: 2026-02-22 17:21:01.742548

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '33c27be9e989'
down_revision: Union[str, Sequence[str], None] = 'a389b03f26b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('suffix', sa.String(length=15), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'suffix')
