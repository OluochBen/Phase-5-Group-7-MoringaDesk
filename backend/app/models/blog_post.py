from datetime import datetime

from .. import db


class BlogPost(db.Model):
    __tablename__ = "blog_posts"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(160), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    excerpt = db.Column(db.String(400))
    content = db.Column(db.Text, nullable=False)
    cover_image = db.Column(db.String(255))
    status = db.Column(db.String(20), default="draft", nullable=False)
    published_at = db.Column(db.DateTime)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    author = db.relationship(
        "User",
        backref=db.backref("blog_posts", lazy=True),
    )

    def is_published(self):
        return self.status == "published"

    def to_dict(self, include_body=True):
        payload = {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "excerpt": self.excerpt,
            "cover_image": self.cover_image,
            "status": self.status,
            "published_at": self.published_at.isoformat() if self.published_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "author": {
                "id": self.author.id if self.author else None,
                "name": self.author.name if self.author else None,
                "email": self.author.email if self.author else None,
            },
        }
        if include_body:
            payload["content"] = self.content
        return payload

    def __repr__(self):
        return f"<BlogPost id={self.id} slug={self.slug!r}>"
