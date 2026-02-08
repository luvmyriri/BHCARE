"""create_visit_logs_table

Revision ID: cdcd43429a91
Revises: 4f677f12ea5d
Create Date: 2026-02-09 02:26:32.798902

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cdcd43429a91'
down_revision: Union[str, Sequence[str], None] = '4f677f12ea5d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create visit_logs table."""
    op.create_table('visit_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('visitor_name', sa.String(length=255), nullable=False),
        sa.Column('purpose', sa.String(length=255), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False), # 'entry' or 'exit'
        sa.Column('timestamp', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_visit_logs_timestamp', 'visit_logs', ['timestamp'])


def downgrade() -> None:
    """Drop visit_logs table."""
    op.drop_index('idx_visit_logs_timestamp', table_name='visit_logs')
    op.drop_table('visit_logs')
