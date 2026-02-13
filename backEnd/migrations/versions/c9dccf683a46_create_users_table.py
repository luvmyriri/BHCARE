"""create_users_table

Revision ID: c9dccf683a46
Revises: a1b2c3d4e5f6
Create Date: 2026-02-07 19:51:11.271981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9dccf683a46'
down_revision: Union[str, Sequence[str], None] = 'f247b3e6830e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create users table with comprehensive fields for patient registration."""
    # Note: This migration comes after address fields migration in the chain,
    # but logically it should be first. The users table may already exist from database.py
    # We use IF NOT EXISTS to avoid conflicts during migration
    
    op.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            middle_name VARCHAR(100),
            last_name VARCHAR(100) NOT NULL,
            date_of_birth DATE NOT NULL,
            gender VARCHAR(20) NOT NULL,
            contact_number VARCHAR(20) NOT NULL,
            barangay VARCHAR(100) NOT NULL,
            city VARCHAR(100) NOT NULL,
            province VARCHAR(100) NOT NULL,
            house_number VARCHAR(50),
            block_number VARCHAR(50),
            lot_number VARCHAR(50),
            street_name VARCHAR(100),
            subdivision VARCHAR(100),
            zip_code VARCHAR(10),
            full_address TEXT,
            id_image_path VARCHAR(255),
            id_image BYTEA,
            ocr_text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create indexes for better query performance
    op.create_index('idx_users_email', 'users', ['email'], unique=True, if_not_exists=True)
    op.create_index('idx_users_created_at', 'users', ['created_at'], if_not_exists=True)


def downgrade() -> None:
    """Drop users table."""
    op.drop_index('idx_users_created_at', table_name='users', if_exists=True)
    op.drop_index('idx_users_email', table_name='users', if_exists=True)
    op.drop_table('users', if_exists=True)
