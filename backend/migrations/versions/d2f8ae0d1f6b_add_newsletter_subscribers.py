"""add newsletter subscribers table

Revision ID: d2f8ae0d1f6b
Revises: 6b069bdc7a72
Create Date: 2025-02-14 22:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd2f8ae0d1f6b'
down_revision = '6b069bdc7a72'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'newsletter_subscribers',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )


def downgrade():
    op.drop_table('newsletter_subscribers')
