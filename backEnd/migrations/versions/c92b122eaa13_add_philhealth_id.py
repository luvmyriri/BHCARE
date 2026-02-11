"""add_philhealth_id

Revision ID: c92b122eaa13
Revises: e05c655a5ea2
Create Date: 2026-02-08 23:02:14.600854

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c92b122eaa13'
down_revision: Union[str, Sequence[str], None] = 'e05c655a5ea2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('philhealth_id', sa.String(length=20), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'philhealth_id')
