"""add blog posts table

Revision ID: c5b7f1f9a123
Revises: d2f8ae0d1f6b
Create Date: 2025-01-05 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "c5b7f1f9a123"
down_revision = "d2f8ae0d1f6b"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "blog_posts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("excerpt", sa.String(length=400), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("cover_image", sa.String(length=255), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default="draft",
        ),
        sa.Column("published_at", sa.DateTime(), nullable=True),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_blog_posts_slug", "blog_posts", ["slug"], unique=False)
    op.create_index("ix_blog_posts_status", "blog_posts", ["status"], unique=False)
    op.create_index(
        "ix_blog_posts_published_at", "blog_posts", ["published_at"], unique=False
    )


def downgrade():
    op.drop_index("ix_blog_posts_published_at", table_name="blog_posts")
    op.drop_index("ix_blog_posts_status", table_name="blog_posts")
    op.drop_index("ix_blog_posts_slug", table_name="blog_posts")
    op.drop_table("blog_posts")
