"""extend faq metadata fields

Revision ID: e6c0de5b7f12
Revises: c5b7f1f9a123
Create Date: 2025-01-05 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import column, table


# revision identifiers, used by Alembic.
revision = "e6c0de5b7f12"
down_revision = "c5b7f1f9a123"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("faqs", sa.Column("category", sa.String(length=100), nullable=True))
    op.add_column("faqs", sa.Column("tags", sa.JSON(), nullable=True))
    op.add_column("faqs", sa.Column("view_count", sa.Integer(), nullable=True))
    op.add_column("faqs", sa.Column("helpful_count", sa.Integer(), nullable=True))
    op.add_column("faqs", sa.Column("updated_at", sa.DateTime(), nullable=True))

    connection = op.get_bind()
    faq_table = table(
        "faqs",
        column("category", sa.String(length=100)),
        column("tags", sa.JSON()),
        column("view_count", sa.Integer()),
        column("helpful_count", sa.Integer()),
        column("updated_at", sa.DateTime()),
        column("created_at", sa.DateTime()),
    )

    connection.execute(
        faq_table.update()
        .where(faq_table.c.category == None)  # noqa: E711
        .values(
            category="General",
            tags=[],
            view_count=0,
            helpful_count=0,
            updated_at=faq_table.c.created_at,
        )
    )

    with op.batch_alter_table("faqs") as batch_op:
        batch_op.alter_column("category", nullable=False)
        batch_op.alter_column("tags", nullable=False)
        batch_op.alter_column("view_count", nullable=False, server_default="0")
        batch_op.alter_column("helpful_count", nullable=False, server_default="0")
        batch_op.alter_column("updated_at", nullable=False)

    with op.batch_alter_table("faqs") as batch_op:
        batch_op.alter_column("view_count", server_default=None)
        batch_op.alter_column("helpful_count", server_default=None)


def downgrade():
    with op.batch_alter_table("faqs") as batch_op:
        batch_op.drop_column("updated_at")
        batch_op.drop_column("helpful_count")
        batch_op.drop_column("view_count")
        batch_op.drop_column("tags")
        batch_op.drop_column("category")
