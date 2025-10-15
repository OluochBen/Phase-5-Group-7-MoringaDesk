"""create feedback table

Revision ID: f0a078a7f21d
Revises: e6c0de5b7f12
Create Date: 2025-01-05 17:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "f0a078a7f21d"
down_revision = "e6c0de5b7f12"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_type", sa.String(length=20), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="normal"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("contact_name", sa.String(length=100), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_feedback_type", "feedback", ["feedback_type"], unique=False)
    op.create_index("ix_feedback_status", "feedback", ["status"], unique=False)
    op.create_index("ix_feedback_priority", "feedback", ["priority"], unique=False)

    # remove server defaults after data migration
    with op.batch_alter_table("feedback") as batch_op:
        batch_op.alter_column("priority", server_default=None)
        batch_op.alter_column("status", server_default=None)


def downgrade():
    op.drop_index("ix_feedback_priority", table_name="feedback")
    op.drop_index("ix_feedback_status", table_name="feedback")
    op.drop_index("ix_feedback_type", table_name="feedback")
    op.drop_table("feedback")
