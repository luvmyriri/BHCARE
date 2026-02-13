"""create_soap_notes_and_notifications_tables

Revision ID: 45c05e2df8ff
Revises: 6a4057200ad1
Create Date: 2026-02-12 15:50:10.414494

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '45c05e2df8ff'
down_revision: Union[str, Sequence[str], None] = '6a4057200ad1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # SOAP Notes Table
    op.create_table('soap_notes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('patient_id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=True), 
        sa.Column('subjective', sa.Text(), nullable=True),
        sa.Column('objective', sa.Text(), nullable=True),
        sa.Column('assessment', sa.Text(), nullable=True),
        sa.Column('plan', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['patient_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['doctor_id'], ['admin_users.id'], ondelete='SET NULL')
    )

    # Notifications Table
    op.create_table('notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False), # e.g., 'soap_note', 'appointment'
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('related_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('soap_notes')
