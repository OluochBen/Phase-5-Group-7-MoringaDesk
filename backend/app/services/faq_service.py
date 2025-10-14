from datetime import datetime

from marshmallow import ValidationError
from sqlalchemy import func, or_

from .. import db
from ..models import FAQ
from ..schemas import FAQCreateSchema


class FAQService:
    @staticmethod
    def create_faq(data, user_id):
        schema = FAQCreateSchema()
        try:
            payload = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        faq = FAQ(
            question=payload["question"],
            answer=payload["answer"],
            category=payload.get("category") or "General",
            tags=payload.get("tags") or [],
            created_by=user_id,
        )
        db.session.add(faq)
        db.session.commit()
        return faq.to_dict(), 201

    @staticmethod
    def get_faqs(page=1, per_page=10, search=None, category=None):
        try:
            page = max(int(page), 1)
        except (TypeError, ValueError):
            page = 1
        try:
            per_page = max(int(per_page), 1)
        except (TypeError, ValueError):
            per_page = 10

        query = FAQ.query

        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                or_(FAQ.question.ilike(term), FAQ.answer.ilike(term))
            )

        if category and category.lower() != "all":
            query = query.filter(func.lower(FAQ.category) == category.strip().lower())

        pagination = db.paginate(
            query.order_by(FAQ.created_at.desc()),
            page=page,
            per_page=per_page,
            error_out=False,
        )

        items = [faq.to_dict() for faq in pagination.items]
        meta = {
            "current_page": pagination.page,
            "pages": pagination.pages or 1,
            "per_page": pagination.per_page,
            "total": pagination.total,
        }

        return {
            "faqs": items,
            "meta": meta,
            "total": meta["total"],
            "pages": meta["pages"],
            "current_page": meta["current_page"],
        }

    @staticmethod
    def get_stats():
        total_faqs = db.session.query(func.count(FAQ.id)).scalar() or 0
        total_views = db.session.query(func.coalesce(func.sum(FAQ.view_count), 0)).scalar() or 0
        total_helpful = (
            db.session.query(func.coalesce(func.sum(FAQ.helpful_count), 0)).scalar() or 0
        )

        category_rows = (
            db.session.query(FAQ.category, func.count(FAQ.id))
            .group_by(FAQ.category)
            .order_by(func.count(FAQ.id).desc())
            .all()
        )
        categories = [
            {"name": category or "General", "count": count}
            for category, count in category_rows
        ]

        return {
            "total_faqs": total_faqs,
            "total_views": total_views,
            "total_helpful": total_helpful,
            "category_count": len(categories),
            "categories": categories,
        }

    @staticmethod
    def record_view(faq_id):
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {"view_count": 0}
        faq.view_count = (faq.view_count or 0) + 1
        faq.updated_at = datetime.utcnow()
        db.session.commit()
        return {"view_count": faq.view_count}

    @staticmethod
    def mark_helpful(faq_id):
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {"helpful_count": 0}
        faq.helpful_count = (faq.helpful_count or 0) + 1
        faq.updated_at = datetime.utcnow()
        db.session.commit()
        return {"helpful_count": faq.helpful_count}

    @staticmethod
    def get_faq_by_id(faq_id):
        faq = FAQ.query.get(faq_id)
        return faq.to_dict() if faq else None

    @staticmethod
    def update_faq(faq_id, data, user_id):
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {"error": "FAQ not found"}, 404

        schema = FAQCreateSchema()
        try:
            payload = schema.load(data or {})
        except ValidationError as err:
            return {"error": err.messages}, 400

        faq.question = payload["question"]
        faq.answer = payload["answer"]
        faq.category = payload.get("category") or faq.category
        faq.tags = payload.get("tags") or []
        faq.updated_at = datetime.utcnow()
        db.session.commit()
        return faq.to_dict(), 200

    @staticmethod
    def delete_faq(faq_id):
        faq = FAQ.query.get(faq_id)
        if not faq:
            return {"error": "FAQ not found"}, 404
        db.session.delete(faq)
        db.session.commit()
        return {"message": "FAQ deleted successfully"}, 200
