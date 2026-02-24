"""add patient_number to users

Revision ID: a2f93c1d7e88
Revises: e5481e5e6e15
Create Date: 2026-02-24 10:57:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text
import random
import string


# revision identifiers, used by Alembic.
revision: str = 'a2f93c1d7e88'
down_revision: Union[str, Sequence[str], None] = 'e5481e5e6e15'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _generate_patient_number(year: int, existing: set) -> str:
    """Generate a unique patient number in YYYY-LLLDDD format."""
    while True:
        letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        digits = ''.join(random.choices(string.digits, k=3))
        pn = f"{year}-{letters}{digits}"
        if pn not in existing:
            existing.add(pn)
            return pn


def upgrade() -> None:
    """Add patient_number column and backfill existing users."""
    # Add the column as nullable first so we can backfill
    op.add_column('users', sa.Column('patient_number', sa.String(20), nullable=True))

    # Backfill existing users
    conn = op.get_bind()
    rows = conn.execute(text("SELECT id, created_at FROM users ORDER BY id")).fetchall()

    existing_numbers: set = set()

    for row in rows:
        user_id = row[0]
        created_at = row[1]
        year = created_at.year if created_at else 2026
        pn = _generate_patient_number(year, existing_numbers)
        conn.execute(
            text("UPDATE users SET patient_number = :pn WHERE id = :uid"),
            {"pn": pn, "uid": user_id}
        )

    # Now make it unique (not strictly NOT NULL so new installs without data work fine)
    op.create_unique_constraint('uq_users_patient_number', 'users', ['patient_number'])


def downgrade() -> None:
    """Remove patient_number column."""
    op.drop_constraint('uq_users_patient_number', 'users', type_='unique')
    op.drop_column('users', 'patient_number')
