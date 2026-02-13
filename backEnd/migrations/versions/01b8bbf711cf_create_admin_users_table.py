"""create_admin_users_table

Revision ID: 01b8bbf711cf
Revises: c9dccf683a46
Create Date: 2026-02-07 19:51:13.905167

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01b8bbf711cf'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create admin_users table for administrative access."""
    op.create_table(
        'admin_users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )
    
    # Create indexes
    op.create_index('idx_admin_users_username', 'admin_users', ['username'], unique=True)
    op.create_index('idx_admin_users_is_active', 'admin_users', ['is_active'])
    
    # Insert default admin user (password: admin123 - should be changed in production)
    op.execute("""
        INSERT INTO admin_users (username, password_hash, email, role) 
        VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIxKTvQiOe', 'admin@bhcare.local', 'admin')
        ON CONFLICT (username) DO NOTHING
    """)


def downgrade() -> None:
    """Drop admin_users table."""
    op.drop_index('idx_admin_users_is_active', table_name='admin_users')
    op.drop_index('idx_admin_users_username', table_name='admin_users')
    op.drop_table('admin_users')
