"""add profile_picture to users

Revision ID: a389b03f26b4
Revises: 45c05e2df8ff
Create Date: 2026-02-21 02:22:55.153496

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a389b03f26b4'
down_revision: Union[str, Sequence[str], None] = '45c05e2df8ff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('profile_picture', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'profile_picture')
