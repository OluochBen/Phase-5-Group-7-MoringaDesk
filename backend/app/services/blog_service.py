import re
from datetime import datetime

from marshmallow import ValidationError
from sqlalchemy import or_

from .. import db
from ..models import BlogPost, User
from ..schemas import BlogPostSchema, BlogPostCreateSchema


_create_schema = BlogPostCreateSchema()
_update_schema = BlogPostCreateSchema(partial=True)
_response_schema = BlogPostSchema()


class BlogService:
    @staticmethod
    def _slugify(value):
        value = value or ""
        slug = re.sub(r"[^\w\s-]", "", value).strip().lower()
        slug = re.sub(r"[\s_-]+", "-", slug)
        slug = slug.strip("-")
        return slug or "post"

    @staticmethod
    def _ensure_unique_slug(base_slug, post_id=None):
        slug = base_slug
        index = 2
        while True:
            query = BlogPost.query.filter(BlogPost.slug == slug)
            if post_id:
                query = query.filter(BlogPost.id != post_id)
            exists = db.session.query(query.exists()).scalar()
            if not exists:
                return slug
            slug = f"{base_slug}-{index}"
            index += 1

    @staticmethod
    def list_posts(page=1, per_page=10, status=None, search=None, include_unpublished=False, author_id=None):
        try:
            page = int(page)
        except (TypeError, ValueError):
            page = 1
        try:
            per_page = int(per_page)
        except (TypeError, ValueError):
            per_page = 10

        page = max(page, 1)
        per_page = max(per_page, 1)

        query = BlogPost.query.order_by(BlogPost.published_at.desc().nullslast(), BlogPost.created_at.desc())

        if not include_unpublished:
            query = query.filter(BlogPost.status == "published")
        elif status:
            if status in {"draft", "published"}:
                query = query.filter(BlogPost.status == status)

        if author_id:
            query = query.filter(BlogPost.author_id == author_id)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                or_(BlogPost.title.ilike(search_term), BlogPost.content.ilike(search_term), BlogPost.excerpt.ilike(search_term))
            )

        pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)
        items = [_response_schema.dump(post) for post in pagination.items]

        meta = {
            "current_page": pagination.page,
            "pages": pagination.pages or 1,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }
        return {"items": items, "meta": meta}

    @staticmethod
    def get_post(identifier, include_unpublished=False):
        query = BlogPost.query
        if isinstance(identifier, int) or (isinstance(identifier, str) and identifier.isdigit()):
            post = query.filter(BlogPost.id == int(identifier)).first()
        else:
            post = query.filter(BlogPost.slug == identifier).first()

        if not post:
            return None

        if not include_unpublished and post.status != "published":
            return None

        return post

    @staticmethod
    def create_post(data, author_id):
        try:
            payload = _create_schema.load(data)
        except ValidationError as err:
            return {"error": err.messages}, 400

        author = User.query.get(author_id)
        if not author:
            return {"error": "Author not found"}, 404

        slug = payload.get("slug") or BlogService._slugify(payload["title"])
        slug = BlogService._ensure_unique_slug(slug)

        status = payload.get("status", "draft")
        published_at = payload.get("published_at")
        if status == "published" and not published_at:
            published_at = datetime.utcnow()
        if status != "published":
            published_at = None

        post = BlogPost(
            slug=slug,
            title=payload["title"],
            excerpt=payload.get("excerpt"),
            content=payload["content"],
            cover_image=payload.get("cover_image"),
            status=status,
            published_at=published_at,
            author_id=author_id,
        )
        db.session.add(post)
        db.session.commit()
        return post.to_dict(), 201

    @staticmethod
    def update_post(post_id, data):
        post = BlogPost.query.get(post_id)
        if not post:
            return {"error": "Post not found"}, 404

        try:
            payload = _update_schema.load(data)
        except ValidationError as err:
            return {"error": err.messages}, 400

        if "title" in payload:
            post.title = payload["title"]
            if "slug" not in payload:
                generated_slug = BlogService._slugify(payload["title"])
                post.slug = BlogService._ensure_unique_slug(generated_slug, post_id=post.id)

        if "slug" in payload and payload["slug"]:
            new_slug = BlogService._ensure_unique_slug(payload["slug"], post_id=post.id)
            post.slug = new_slug

        if "excerpt" in payload:
            post.excerpt = payload["excerpt"]
        if "content" in payload:
            post.content = payload["content"]
        if "cover_image" in payload:
            post.cover_image = payload["cover_image"]

        if "status" in payload:
            prev_status = post.status
            post.status = payload["status"]
            if post.status == "published" and not post.published_at:
                post.published_at = payload.get("published_at") or datetime.utcnow()
            elif post.status != "published":
                post.published_at = None
            elif payload.get("published_at"):
                post.published_at = payload["published_at"]
            elif prev_status != "published" and post.status == "published":
                post.published_at = datetime.utcnow()
        elif "published_at" in payload and payload["published_at"]:
            post.published_at = payload["published_at"]

        db.session.commit()
        return post.to_dict(), 200

    @staticmethod
    def delete_post(post_id):
        post = BlogPost.query.get(post_id)
        if not post:
            return {"error": "Post not found"}, 404
        db.session.delete(post)
        db.session.commit()
        return {"message": "Post deleted"}, 200
